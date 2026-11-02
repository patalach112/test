# GitHub-style workspace

The original light-mode snapshot has been extended with a dark theme, live public repository browsing, and independent account screens. See [auth-integration.md](auth-integration.md) for routes, backend API contract, setup, tests, security boundaries, and remaining limitations.

# Original implementation notes (historical)

Source: https://github.com/patalach112/test (public HTML and embedded repository data inspected).
Local route: `/` — repository overview, file navigation and client-side repository tabs.

Implementation: `src/components/sites/github/repository.tsx`; shared styles: `src/app/globals.css`.
`data.json` contains the source repository tree and text files from the initial commit.
`readme.ts` contains the public README markup, with remote badge images removed.

The light theme uses GitHub's system font stack, neutral canvas, bordered file table, green primary actions, repository sidebar and responsive navigation.

Local behavior: directory/file browsing, file filtering, search dialog (also `/` shortcut), branch selector, clone-protocol switcher, clipboard, star toggle, watch settings, issue creation and filtering, navigation and dismissible dialogs. Issues and stars are in-memory demo state, not persisted or sent to GitHub. Non-implemented service features explicitly link to GitHub. No credentials are collected.

Scope/limitations: no live backend, authentication, actual repository mutation, or full GitHub route parity. Icons use Lucide except the GitHub mark. Avatar is a local placeholder; language figures are illustrative. Remote README badges omitted. Visual pixel parity has not been confirmed with browser screenshots.

Validation: ESLint, TypeScript, production build, and HTTP preview smoke check. No automated browser suite is installed in the starting template.
