# FirmwareWatch

An independent developer workspace for **firmwarewatch.com**, built with Next.js 16, React, and TypeScript. Dark GitHub-inspired public homepage, account pages, an authenticated dashboard, and a live public repository browser.

This is not GitHub.com, a GitHub login provider, or a full Git hosting service. Use a separate FirmwareWatch account and password.

## Run locally

Requires **Node.js 24+** (the local account database uses built-in `node:sqlite`).

```sh
npm ci
npm run dev -- --hostname 0.0.0.0
```

Open `http://localhost:3000`. **Sign-up and sign-in work immediately**, without an external auth API. Create an account at `/signup`; successful authentication opens `/dashboard`.

Accounts persist in `data/firmwarewatch.sqlite` on your machine. Passwords are scrypt-hashed; session tokens are random, stored as hashes, and revoked on sign-out. Database and session files are excluded from Git and Docker build contexts. Keep the data directory on a persistent local disk, restrict its permissions, and back it up. Do not host this SQLite configuration on an ephemeral/serverless filesystem or share it between multiple machines.

## Host with your existing Cloudflare Tunnel

On the machine running your tunnel:

1. Copy `.env.example` to `.env.local`.
2. Uncomment `APP_ORIGIN=https://firmwarewatch.com`.
3. Leave `AUTH_API_URL` empty to use the built-in local account database.
4. Run:

   ```sh
   npm ci
   npm run build
   npm run start -- --hostname 127.0.0.1 --port 3000
   ```

5. Point the `firmwarewatch.com` published application in your Cloudflare Tunnel to `http://localhost:3000`. An example ingress configuration is in `deploy/cloudflared.yml.example`. Merge it into **your existing tunnel config** and retain the final catch-all rule.
6. Restart your existing cloudflared tunnel. If the hostname is already attached to that tunnel, no new tunnel or DNS record is needed. Otherwise, add the hostname through the Cloudflare dashboard or your normal tunnel DNS workflow.

The public URL uses HTTPS; Cloudflare terminates TLS and proxies to the local HTTP service. Secure, HttpOnly session cookies work with the configured public origin. Configure the tunnel/proxy to preserve the public Host and overwrite forwarded protocol/host headers with trusted values. The app uses relative API URLs, so browser requests never go to the visitor's localhost.

**The code does not change your DNS, Cloudflare account, or running tunnel remotely.** Your host must run both the application and cloudflared. If cloudflared runs in another Docker container, use the app's Docker service address instead of `localhost`.

### Docker (optional)

```sh
docker compose up -d --build app
```

The app is exposed on `127.0.0.1:3000`; account data lives in the persistent `firmwarewatch-data` named volume. Docker execution has not been tested in this sandbox. Do not delete the volume when upgrading. For a process running on the host, cloudflared can target the published localhost port.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Dark public homepage, navigation menus, signup CTA and interactive illustrative code preview |
| `/signup` | Create a FirmwareWatch account |
| `/login` | Sign in |
| `/dashboard` | Authenticated workspace |
| `/patalach112/test` | Browse a public GitHub repository through the read-only API |
| `/password-reset` | Recovery availability; local mode explicitly has no email provider |

The homepage email field carries the email into the signup form. Account pages belong to FirmwareWatch, not GitHub. An optional external identity API can replace the built-in database; see [auth integration](docs/research/github/auth-integration.md).

## Checks

```sh
npm run lint
npm run typecheck
npm run build
# Stop dev servers before integration tests (they start their own dev app).
node scripts/test-local-auth.mjs
node scripts/test-auth.mjs
```

Local tests use disposable accounts/databases, exercise restart persistence, failed/successful login, uniqueness, protected dashboard, origin rejection, rate limits, cookie flags, hashed storage, and session revocation. The external test uses a disposable mock upstream, never real credentials.

## Scope

This is a dark **adaptation**, not a verified pixel-identical reproduction of GitHub. The homepage uses FirmwareWatch copy/branding and a hand-built illustrative product preview; it does not claim GitHub's user counts, customers, Copilot, or other services. The repository browser reads live public data, with a labelled fallback snapshot and some snapshot metadata. Repository writes, local Git hosting, pull-request processing, Actions, and repository creation are not implemented; repository demo controls do not mutate GitHub.

Local authentication supports registration, login, and logout, but not email verification, MFA, or email-based password reset. Recovery explicitly reports that mail is unconfigured. Persistent throttles provide basic protection; additional infrastructure controls and a production security review are recommended before public launch.
