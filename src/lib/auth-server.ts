import "server-only";
import { cookies } from "next/headers";

export const sessionCookie = "forge_session";
export type User = { id: string; username: string; email?: string };

export function authConfigured() {
  return Boolean(process.env.AUTH_API_URL);
}

export async function authRequest(action: string, options: RequestInit = {}) {
  const base = process.env.AUTH_API_URL;
  if (!base) throw new Error("Authentication server is not configured.");
  const url = new URL(base);
  if (
    url.protocol !== "https:" &&
    !(
      process.env.NODE_ENV !== "production" &&
      ["localhost", "127.0.0.1"].includes(url.hostname)
    )
  ) {
    throw new Error("Authentication server requires HTTPS.");
  }
  const paths: Record<string, string> = {
    login: process.env.AUTH_LOGIN_PATH || "auth/login",
    register: process.env.AUTH_REGISTER_PATH || "auth/register",
    me: process.env.AUTH_ME_PATH || "auth/me",
    logout: process.env.AUTH_LOGOUT_PATH || "auth/logout",
    reset: process.env.AUTH_RESET_PATH || "auth/password-reset",
  };
  return fetch(new URL(paths[action], base.endsWith("/") ? base : base + "/"), {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(10000),
  });
}

export async function getUser(): Promise<User | null> {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token || !authConfigured()) return null;
  try {
    const response = await authRequest("me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    const body = await response.json();
    const user = body.user;
    return user &&
      typeof user.id === "string" &&
      typeof user.username === "string"
      ? user
      : null;
  } catch {
    return null;
  }
}
