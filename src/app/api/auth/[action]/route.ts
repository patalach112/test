import { AuthError, localAuthenticate, localLogout } from "@/lib/local-auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  authConfigured,
  authRequest,
  getUser,
  sessionCookie,
} from "@/lib/auth-server";

const json = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params;
  if (action !== "session") return json({ error: "Not found" }, 404);
  return json({ configured: authConfigured(), user: await getUser() });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params;
  if (!["login", "register", "logout", "reset"].includes(action))
    return json({ error: "Not found" }, 404);
  const origin = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  try {
    if (
      !origin ||
      (process.env.APP_ORIGIN
        ? new URL(origin).origin !== new URL(process.env.APP_ORIGIN).origin
        : new URL(origin).host !== host)
    )
      return json({ error: "Invalid request origin." }, 403);
  } catch {
    return json({ error: "Invalid request origin." }, 403);
  }
  const store = await cookies();
  const token = store.get(sessionCookie)?.value;
  if (action === "logout") {
    store.delete(sessionCookie);
    if (token && !process.env.AUTH_API_URL) localLogout(token);
    if (token && process.env.AUTH_API_URL) {
      try {
        await authRequest("logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        /* Local session is cleared even if upstream is down. */
      }
    }
    return json({ ok: true });
  }
  if (!authConfigured())
    return json(
      {
        error:
          "Your authentication server is not connected yet. Configure AUTH_API_URL to enable accounts.",
      },
      503,
    );
  if (!request.headers.get("content-type")?.includes("application/json"))
    return json({ error: "JSON required." }, 415);
  const raw = await request.text();
  if (raw.length > 8192) return json({ error: "Request too large." }, 413);
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
  if (!body || typeof body !== "object")
    return json({ error: "Invalid request." }, 400);
  const { login, password, username, email } = body;
  const validString = (s: unknown, min: number, max: number): s is string =>
    typeof s === "string" && s.trim().length >= min && s.length <= max;
  if (
    action === "login" &&
    (!validString(login, 1, 254) || !validString(password, 1, 128))
  )
    return json({ error: "Enter your username and password." }, 400);
  if (
    (action === "register" || action === "reset") &&
    (!validString(email, 3, 254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  )
    return json({ error: "Enter a valid email address." }, 400);
  if (
    action === "register" &&
    (!validString(username, 1, 39) ||
      !/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(username) ||
      !validString(password, 12, 128))
  )
    return json(
      { error: "Use a valid username and a password of 12–128 characters." },
      400,
    );
  const payload =
    action === "login"
      ? { login, password }
      : action === "register"
        ? { username, email, password }
        : { email };
  try {
    let result;
    if (!process.env.AUTH_API_URL) {
      if (action === "reset")
        return json(
          {
            error:
              "Email recovery is not configured for this server. Contact the FirmwareWatch administrator.",
          },
          503,
        );
      result = await localAuthenticate(action as "login" | "register", {
        login,
        username,
        email,
        password,
      });
    } else {
      const upstream = await authRequest(action, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!upstream.ok) {
        if (upstream.status === 429)
          return json(
            { error: "Too many attempts. Please try again later." },
            429,
          );
        return json(
          {
            error:
              action === "login"
                ? "Unable to sign in. Check your credentials and try again."
                : "Unable to complete this request. Please try again.",
          },
          upstream.status >= 500 ? 502 : 400,
        );
      }
      if (action === "reset") return json({ ok: true });
      result = await upstream.json();
    }
    if (action === "register" && result.requiresVerification === true)
      return json({ requiresVerification: true });
    if (
      typeof result.accessToken !== "string" ||
      result.accessToken.length < 1 ||
      result.accessToken.length > 3800
    )
      return json(
        {
          error:
            "Unexpected authentication response. Check the server integration.",
        },
        502,
      );
    const lifetime = Number(result.expiresIn);
    store.set(sessionCookie, result.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure:
        Boolean(process.env.APP_ORIGIN?.startsWith("https://")) ||
        request.nextUrl.protocol === "https:" ||
        request.headers.get("x-forwarded-proto") === "https",
      path: "/",
      maxAge: Number.isFinite(lifetime)
        ? Math.max(1, Math.min(lifetime, 86400))
        : 3600,
    });
    return json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError)
      return json({ error: error.message }, error.status);
    return json(
      {
        error:
          "Authentication is temporarily unavailable. Please try again later.",
      },
      502,
    );
  }
}
