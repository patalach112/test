# FirmwareWatch account integration

## Default: built-in accounts

No separate server setup is needed: without `AUTH_API_URL`, registration, login, session validation, and logout run inside the Next.js Node server. Node 24+ is required for `node:sqlite`.

- `AUTH_DB_PATH` defaults to `data/firmwarewatch.sqlite`, ignored by Git and excluded from Docker images.
- Users have unique case-insensitive usernames/emails, random IDs, and salted scrypt password hashes. Plaintext passwords are never stored or logged.
- Session tokens are 32 random bytes, SHA-256 hashed in SQLite, expire after 24 hours, and are revoked at logout.
- Cookies are HttpOnly, SameSite=Lax, and Secure on the configured HTTPS origin or HTTPS request.
- `/api/auth/session` checks the session against the database, not just the presence of a cookie.
- Account-specific and global SQLite-backed 15-minute throttles do not trust visitor-supplied IP headers.
- POST requests validate the Origin against `APP_ORIGIN` when configured; otherwise against the request host. Configure `APP_ORIGIN=https://firmwarewatch.com` on your public host. The reverse proxy must sanitize forwarded headers.
- Account recovery in local mode returns 503 with an explicit unavailable-mail message. No reset emails or verification emails are fabricated.
- A single persistent host is supported, not serverless/ephemeral or distributed SQLite. Back up using SQLite's backup tooling, or stop the app before copying the database and its WAL files.

Local auth API:

| Method/path | Body/result |
| --- | --- |
| POST `/api/auth/register` | `{ username, email, password }` → `{ ok: true }` plus session cookie |
| POST `/api/auth/login` | `{ login, password }` → `{ ok: true }` plus session cookie |
| GET `/api/auth/session` | `{ configured: true, user: { id, username, email } \| null }` |
| POST `/api/auth/logout` | Revokes current session and clears cookie |
| POST `/api/auth/reset` | Local mode: unavailable until a mail/recovery provider is implemented |

## Optional: external identity API

Setting server-only `AUTH_API_URL` switches to the existing adapter **instead of** local accounts. Account migration between modes is not automatic. Paths can be overridden with the `AUTH_*_PATH` variables from `.env.example`.

| Method/path | Request | Successful response |
| --- | --- | --- |
| POST `auth/login` | `{ "login": "username-or-email", "password": "…" }` | `{ "accessToken": "opaque-token", "expiresIn": 3600 }` |
| POST `auth/register` | `{ "username": "…", "email": "…", "password": "…" }` | Token response or `{ "requiresVerification": true }` |
| GET `auth/me` | `Authorization: Bearer <token>` | `{ "user": { "id": "string-id", "username": "…", "email": "optional" } }` |
| POST `auth/logout` | `Authorization: Bearer <token>` | Any 2xx; revoke the token upstream |
| POST `auth/password-reset` | `{ "email": "…" }` | Any 2xx, including unknown accounts |

The browser calls same-origin `/api/auth/*`; only the Next server contacts the upstream. Tokens never appear in response JSON or local storage. Upstream calls require HTTPS (development localhost excepted), have a 10-second timeout, disable caching, and reject redirects. Cookie-only upstream APIs require adapting this contract. Production backend security, email, account lifecycle, and MFA remain the identity provider's responsibility.

## Verification

- `node scripts/test-local-auth.mjs`: disposable SQLite database and dev server; checks account/session persistence across process restart, registration, uniqueness, login, cookie flags, logout revocation, throttling, origin rejection, protected dashboard, password/session hashes, and unavailable mail.
- `node scripts/test-auth.mjs`: disposable external mock service; checks the optional adapter lifecycle.
- Browser checks at 1440px and 390px: homepage menus and demo tabs, signup email handoff, account form submission, signed-in dashboard and reload, sign-out/sign-in, repository navigation, no horizontal page overflow and no page runtime errors.

These checks do not establish a completed production security audit or GitHub feature parity.
