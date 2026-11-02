# Dark workspace and authentication integration

## Routes

- `/` — dark GitHub-style repository UI. The directory listing, text file contents, and README come from the public GitHub API via `/api/repository`. Read-only, fixed to `patalach112/test`; public API rate limits apply. A labelled snapshot is shown when unavailable. Commit metadata and language figures remain snapshot/demo values. Star/watch/issues are still local demonstration controls, not GitHub mutations.
- `/login` — sign in to this independent workspace.
- `/signup` — create an account on your server.
- `/password-reset` — request a reset email from your server.
- `/api/auth/session` — current user and configuration status.

The account UI is intentionally identified as **Forge**, an independent workspace, not GitHub.com. Never enter GitHub passwords into it. No GitHub OAuth integration is claimed.

## Connect your server

Copy `.env.example` to `.env.local`, set `AUTH_API_URL` to your backend's HTTPS base URL, and restart Next.js. Do not use a `NEXT_PUBLIC_` variable: only the Next.js server calls the backend. Endpoint paths can be overridden with the `AUTH_*_PATH` variables. Paths are resolved relative to the base URL, which may include `/api/`.

Example contract (adapt the server-side adapter if your existing API differs):

| Method/path | Request | Successful response |
| --- | --- | --- |
| POST `auth/login` | `{ "login": "username-or-email", "password": "…" }` | `{ "accessToken": "opaque-token", "expiresIn": 3600 }` |
| POST `auth/register` | `{ "username": "…", "email": "…", "password": "…" }` | Same token response, **or** `{ "requiresVerification": true }` |
| GET `auth/me` | `Authorization: Bearer <token>` | `{ "user": { "id": "string-id", "username": "…", "email": "optional" } }` |
| POST `auth/logout` | `Authorization: Bearer <token>` | Any 2xx; revoke the token server-side |
| POST `auth/password-reset` | `{ "email": "…" }` | Any 2xx, including for unknown accounts |

Client requests are same-origin `/api/auth/*`; there are no browser requests to localhost or cross-origin backend addresses. Without configuration, inputs are disabled and POST authentication endpoints return 503. There is no fake login or seeded account.

### Session and security boundaries

- The server stores the upstream token in an HttpOnly, SameSite=Lax cookie, Secure when served over HTTPS. It never returns the token in JSON or stores it in local/session storage.
- Session lifetime is capped at 24 hours (default 1 hour); no refresh-token flow is assumed.
- `/auth/me` validates the session with the backend; a cookie alone does not establish a logged-in user.
- Mutating API requests check the request Origin against the host. The deployment proxy must overwrite forwarded host/protocol headers with trusted values.
- No request bodies, credentials, or tokens are logged. Upstream errors are sanitized.
- Upstream requests enforce HTTPS (localhost HTTP only in development), a 10-second timeout, no caching, and no redirects.
- **Your backend must implement** password hashing, account persistence, uniqueness, email verification/reset tokens and mail delivery, per-user/IP throttling, token expiry/revocation, authorization, audit controls, and MFA if needed. This frontend is not an identity server. Cookie-only upstream APIs need an adapter change; do not forward arbitrary cookies between domains.
- No production security certification or full GitHub backend feature parity is implied.

## Verification

- `npm run lint`, `npm run typecheck`, `npm run build`.
- With dev servers stopped, `node scripts/test-auth.mjs` launches a disposable local mock backend and dev app. Checks validation, rejected credentials, cross-origin rejection, verification-required registration, HttpOnly cookie creation, upstream session lookup, authenticated redirect, reset request, logout and upstream revocation. No real credentials used.
- Desktop (1440px) and mobile (390px) browser checks exercised login/signup navigation, unconfigured input disabling, live repository loading, clone menu, directory navigation, no horizontal page overflow, and no browser runtime errors. Captures were inspected locally; exact visual equivalence to all GitHub pages is not claimed.
- Sandbox-only TLS setup: the preview uses `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt` to trust the environment's installed CA. Certificate verification was not disabled. Ordinary deployments should use their standard trusted CA store.
