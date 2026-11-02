import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, chmodSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt);
let database: DatabaseSync | undefined;
function db() {
  if (database) return database;
  const path = resolve(
    /* turbopackIgnore: true */ process.env.AUTH_DB_PATH ||
      "data/firmwarewatch.sqlite",
  );
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  database = new DatabaseSync(path);
  chmodSync(path, 0o600);
  database.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT NOT NULL COLLATE NOCASE UNIQUE, email TEXT NOT NULL COLLATE NOCASE UNIQUE, password_hash TEXT NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);`);
  return database;
}
const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
function limit(key: string, maximum: number) {
  const now = Date.now();
  const keyHash = digest(key);
  db().prepare("DELETE FROM limits WHERE expires_at < ?").run(now);
  db()
    .prepare(
      "INSERT INTO limits(key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1",
    )
    .run(keyHash, now + 15 * 60 * 1000);
  const row = db()
    .prepare("SELECT count FROM limits WHERE key=?")
    .get(keyHash) as { count: number };
  if (row.count > maximum)
    throw new AuthError(
      "Too many attempts. Please try again in 15 minutes.",
      429,
    );
}
export function localUser(token: string) {
  const now = Date.now();
  db().prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now);
  const user = db()
    .prepare(
      "SELECT users.id, username, email FROM sessions JOIN users ON users.id=sessions.user_id WHERE token_hash=? AND expires_at>?",
    )
    .get(digest(token), now);
  return user
    ? {
        id: String(user.id),
        username: String(user.username),
        email: String(user.email),
      }
    : null;
}
export function localLogout(token: string) {
  db().prepare("DELETE FROM sessions WHERE token_hash=?").run(digest(token));
}
export async function localAuthenticate(
  action: "login" | "register",
  input: {
    login?: string;
    username?: string;
    email?: string;
    password: string;
  },
) {
  // Shared and account-specific persistent limits, independent of spoofable forwarded IP headers.
  limit("global-auth", 300);
  limit(`${action}:${(input.login || input.email || "").toLowerCase()}`, 10);
  let userId: string;
  if (action === "register") {
    limit("global-registration", 30);
    const salt = randomBytes(16).toString("hex");
    const key = (await derive(input.password, salt, 64)) as Buffer;
    userId = randomUUID();
    try {
      db()
        .prepare(
          "INSERT INTO users(id,username,email,password_hash,created_at) VALUES (?,?,?,?,?)",
        )
        .run(
          userId,
          input.username!.trim(),
          input.email!.trim().toLowerCase(),
          `${salt}:${key.toString("hex")}`,
          Date.now(),
        );
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE"))
        throw new AuthError(
          "Unable to create this account. Try another username or email, or sign in.",
          409,
        );
      throw error;
    }
  } else {
    const identity = input.login!.trim().toLowerCase();
    const user = db()
      .prepare("SELECT id,password_hash FROM users WHERE username=? OR email=?")
      .get(identity, identity) as
      { id: string; password_hash: string } | undefined;
    const [salt, stored] = (
      user?.password_hash ||
      "00000000000000000000000000000000:" + "0".repeat(128)
    ).split(":");
    const key = (await derive(input.password, salt, 64)) as Buffer;
    if (!user || !timingSafeEqual(key, Buffer.from(stored, "hex")))
      throw new AuthError("Incorrect username or password.", 401);
    userId = user.id;
  }
  const accessToken = randomBytes(32).toString("base64url");
  db().prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());
  db()
    .prepare(
      "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES (?,?,?)",
    )
    .run(digest(accessToken), userId, Date.now() + 86400000);
  return { accessToken, expiresIn: 86400 };
}
