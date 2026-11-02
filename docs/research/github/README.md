# FirmwareWatch source and route map

Reference inspected: public HTML from https://github.com on 2026-11-02. Its current hero headline is “Software still starts with you”; section headings include GitHub Platform, More ways to use GitHub, and featured repositories. Remote reference media hosts were outside this workspace's network allowlist, so proprietary artwork/video/font assets were not copied.

The requested dark theme is applied as a FirmwareWatch-branded adaptation, not a claim of literal pixel parity with the currently served public GitHub page. Hero, public navigation, signup CTA, interactive HTML code preview, feature sections, self-hosting panel, and footer are implemented in editable components. No fabricated customer logos, service claims, or developer counts are used.

| Source concept | Local route/component |
| --- | --- |
| Public GitHub home | `/`, `src/components/firmwarewatch/home.tsx` |
| Sign in / sign up | `/login`, `/signup`, `src/components/auth/auth-form.tsx` |
| Authenticated workspace | `/dashboard` |
| Public repository overview | `/patalach112/test`, `src/components/sites/github/repository.tsx` |
| Repository data | `/api/repository` (live, read-only GitHub API) |
| Independent accounts | `/api/auth/*`, `src/lib/local-auth.ts` |

See root README for Cloudflare Tunnel hosting, known limitations, and validation commands. See [auth integration](auth-integration.md) for account storage and optional external backend configuration. Browser screenshots used for local inspection are scratch artifacts, not committed assets.
