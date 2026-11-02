import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { DatabaseSync } from "node:sqlite";

const directory = await mkdtemp(join(tmpdir(), "firmwarewatch-test-"));
const database = join(directory, "accounts.sqlite");
const base = "http://localhost:3102";
let app;
async function start() {
  app = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--hostname",
      "0.0.0.0",
      "--port",
      "3102",
    ],
    {
      env: {
        ...process.env,
        APP_ORIGIN: base,
        AUTH_API_URL: "",
        AUTH_DB_PATH: database,
        NEXT_TELEMETRY_DISABLED: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Server startup timed out")),
      60000,
    );
    app.stdout.on("data", (chunk) => {
      if (chunk.toString().includes("Ready")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    app.stderr.on("data", (chunk) => {
      if (
        !chunk.toString().includes("ExperimentalWarning") &&
        !chunk.toString().includes("trace-warnings")
      )
        process.stderr.write(chunk);
    });
    app.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Server exited: ${code}`));
    });
  });
}
async function stop() {
  if (app && app.exitCode === null) {
    app.kill("SIGTERM");
    await once(app, "exit");
  }
}
const post = (action, body, cookie, origin = base, extra = {}) =>
  fetch(`${base}/api/auth/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      ...(cookie ? { Cookie: cookie } : {}),
      ...extra,
    },
    body: JSON.stringify(body),
  });
const session = async (cookie) =>
  await (
    await fetch(`${base}/api/auth/session`, { headers: { Cookie: cookie } })
  ).json();
try {
  await start();
  for (const route of [
    "/",
    "/login",
    "/signup?email=test%40example.com",
    "/patalach112/test",
  ])
    assert.equal((await fetch(base + route)).status, 200);
  assert.equal(
    (await fetch(base + "/dashboard", { redirect: "manual" })).status,
    307,
  );
  const account = {
    username: "firmware-tester",
    email: "tester@example.com",
    password: "testing-a-strong-password-123",
  };
  assert.equal(
    (await post("register", account, null, "https://attacker.example")).status,
    403,
  );
  assert.equal(
    (await post("register", { ...account, password: "short" })).status,
    400,
  );
  const registered = await post("register", account);
  assert.equal(registered.status, 200, await registered.clone().text());
  assert.deepEqual(await registered.json(), { ok: true });
  const cookie = registered.headers.get("set-cookie").split(";")[0];
  assert.match(registered.headers.get("set-cookie"), /HttpOnly/i);
  assert.match(registered.headers.get("set-cookie"), /SameSite=lax/i);
  assert.equal((await session(cookie)).user.username, account.username);
  assert.equal(
    (await fetch(base + "/dashboard", { headers: { Cookie: cookie } })).status,
    200,
  );
  const duplicate = await post("register", {
    ...account,
    username: "FIRMWARE-TESTER",
    email: "other@example.com",
  });
  assert.equal(duplicate.status, 409);
  assert.equal(
    (await post("login", { login: account.username, password: "incorrect" }))
      .status,
    401,
  );
  // Process restart must preserve both the account and active session.
  await stop();
  await start();
  assert.equal((await session(cookie)).user.username, account.username);
  const signedIn = await post(
    "login",
    { login: account.email.toUpperCase(), password: account.password },
    null,
    base,
    { "x-forwarded-proto": "https" },
  );
  assert.equal(signedIn.status, 200);
  assert.match(signedIn.headers.get("set-cookie"), /Secure/);
  const secondCookie = signedIn.headers.get("set-cookie").split(";")[0];
  assert.equal((await post("logout", {}, secondCookie)).status, 200);
  assert.equal((await session(secondCookie)).user, null);
  assert.equal((await post("reset", { email: account.email })).status, 503);
  for (let n = 0; n < 10; n++)
    await post("login", { login: "nobody", password: "wrong" });
  assert.equal(
    (await post("login", { login: "nobody", password: "wrong" })).status,
    429,
  );
  const db = new DatabaseSync(database);
  const row = db.prepare("SELECT password_hash FROM users").get();
  assert.notEqual(row.password_hash, account.password);
  assert.match(row.password_hash, /^[0-9a-f]{32}:[0-9a-f]{128}$/);
  const tokens = db.prepare("SELECT token_hash FROM sessions").all();
  assert.ok(tokens.every((t) => /^[0-9a-f]{64}$/.test(t.token_hash)));
  db.close();
  console.log(
    "PASS: local registration, uniqueness, login, durable accounts and sessions across restart, password hashing, hashed session storage, Secure/HttpOnly cookies, logout revocation, CSRF protection, throttling, protected dashboard and explicit unavailable mail recovery.",
  );
} finally {
  await stop();
  await rm(directory, { recursive: true, force: true });
}
