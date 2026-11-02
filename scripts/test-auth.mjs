// Integration test against a disposable local upstream, never real credentials.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";

let revoked = false;
const upstream = createServer(async (req, res) => {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = raw ? JSON.parse(raw) : {};
  res.setHeader("Content-Type", "application/json");
  if (req.url === "/auth/me") {
    res.statusCode =
      req.headers.authorization === "Bearer integration-test-token" && !revoked
        ? 200
        : 401;
    res.end(JSON.stringify({ user: { id: "test-user", username: "tester" } }));
  } else if (req.url === "/auth/logout") {
    revoked = true;
    res.end("{}");
  } else if (req.url === "/auth/password-reset") res.end("{}");
  else if (req.url === "/auth/register") {
    assert.equal(body.username, "tester");
    res.end(JSON.stringify({ requiresVerification: true }));
  } else if (body.password === "test-password-123") {
    revoked = false;
    res.end(
      JSON.stringify({
        accessToken: "integration-test-token",
        expiresIn: 3600,
      }),
    );
  } else {
    res.statusCode = 401;
    res.end("{}");
  }
});
upstream.listen(0, "127.0.0.1");
await once(upstream, "listening");
const port = upstream.address().port;
const appPort = 3101;
const base = `http://localhost:${appPort}`;
const app = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "dev",
    "--hostname",
    "0.0.0.0",
    "--port",
    String(appPort),
  ],
  {
    env: {
      ...process.env,
      AUTH_API_URL: `http://127.0.0.1:${port}/`,
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Test app did not start")),
      60000,
    );
    app.stdout.on("data", (chunk) => {
      if (chunk.toString().includes("Ready")) {
        clearTimeout(timer);
        resolve();
      }
    });
    app.stderr.on("data", (chunk) => process.stderr.write(chunk));
    app.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Test app exited: ${code}`));
    });
  });
  const post = (action, body, cookie, origin = base) =>
    fetch(`${base}/api/auth/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body),
    });
  for (const route of ["/login", "/signup", "/password-reset"])
    assert.equal((await fetch(base + route)).status, 200, route);
  assert.equal(
    (await post("login", { login: "tester", password: "wrong" })).status,
    400,
  );
  assert.equal(
    (
      await post(
        "login",
        { login: "tester", password: "test-password-123" },
        null,
        "https://attacker.example",
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await post("register", {
        username: "tester",
        email: "bad",
        password: "short",
      })
    ).status,
    400,
  );
  const registration = await post("register", {
    username: "tester",
    email: "test@example.com",
    password: "test-password-123",
  });
  assert.deepEqual(await registration.json(), { requiresVerification: true });
  assert.equal(registration.headers.get("set-cookie"), null);
  const login = await post("login", {
    login: "tester",
    password: "test-password-123",
  });
  assert.equal(login.status, 200);
  assert.deepEqual(await login.json(), { ok: true });
  const cookieHeader = login.headers.get("set-cookie");
  assert.match(cookieHeader, /HttpOnly/i);
  assert.match(cookieHeader, /SameSite=lax/i);
  const cookie = cookieHeader.split(";")[0];
  const session = await fetch(`${base}/api/auth/session`, {
    headers: { Cookie: cookie },
  });
  assert.equal((await session.json()).user.username, "tester");
  const signedInLogin = await fetch(`${base}/login`, {
    headers: { Cookie: cookie },
    redirect: "manual",
  });
  assert.equal(signedInLogin.status, 307);
  assert.deepEqual(
    await (await post("reset", { email: "test@example.com" })).json(),
    { ok: true },
  );
  assert.equal((await post("logout", {}, cookie)).status, 200);
  assert.equal(revoked, true);
  assert.equal(
    (
      await (
        await fetch(`${base}/api/auth/session`, { headers: { Cookie: cookie } })
      ).json()
    ).user,
    null,
  );
  console.log(
    "PASS: auth routes, validation, origin protection, sign-in, HttpOnly session, redirect, registration, reset, sign-out and revocation",
  );
} finally {
  app.kill("SIGTERM");
  await once(app, "exit");
  upstream.close();
}
