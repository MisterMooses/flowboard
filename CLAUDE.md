# Flowboard

Personal AI-powered Kanban board — a native Windows desktop app (Electron). Public repo: `github.com/MisterMooses/flowboard`.

## Product philosophy

Flowboard is built neurodivergent-first: **radical simplicity**, offloading organizational decisions instead of adding new interfaces to learn. This is the lens for every UI/UX decision — the AI command bar should eliminate overhead, not create a new thing to configure. Prefer removing friction over adding options. Currently distributed to a small tester group; commercialization (subscription pricing, cross-device sync, web app delivery) is on the roadmap but not yet built.

## Stack

- **Electron 31**, vanilla JavaScript — no frontend framework
- **UI**: single file `src/index.html` (~4,400 lines) — all HTML, CSS, and JS co-located. This is the file you'll spend most of your time in.
- **Main process**: `main.js` — window management, IPC handlers, local file storage, Anthropic API calls, auto-updater
- **Preload**: `preload.js` — contextBridge API exposed to the renderer as `window.flowboard.*`
- **AI**: Anthropic API (`claude-sonnet-4-6`), called server-side from `main.js` via raw `https` request (not the SDK) — see `call-anthropic` IPC handler
- **Updates**: `electron-updater`, publishing to GitHub Releases
- **Installer**: `electron-builder` (NSIS, Windows only, per-user install, no admin/UAC)

## Data storage

User data lives outside the repo, in `%AppData%\flowboard\`:
- `tasks.json` — all cards
- `config.json` — API key, theme, work hours/days, auto-archive settings

Never touched by installs/uninstalls/updates (`deleteAppDataOnUninstall: false`).

## Commands

```bash
npm start            # run the app locally (electron .)
npm run build         # build unpublished Windows installer -> dist/
npm run publish       # build AND publish a GitHub release (needs GH_TOKEN env var set)
```

`GH_TOKEN` is set as a persistent Windows user environment variable (`setx`) — it is not stored in the repo. `npm run publish` produces the NSIS installer plus `latest.yml`, which `electron-updater` reads to detect updates for existing installs.

## Architecture notes

- IPC surface is defined in `preload.js` (renderer-safe API) and implemented in `main.js` (`ipcMain.handle(...)`). If you add a new capability the renderer needs from the main process, it goes in both places.
- `context Isolation: true`, no `nodeIntegration` — the renderer only ever talks to the main process through the `window.flowboard` bridge. Keep it that way; don't reach for `nodeIntegration` shortcuts.
- The Anthropic API key is entered by the user on first launch and stored in `config.json` locally — it is never bundled or committed.
- Auto-updater flow: main process checks GitHub Releases → renderer shows a download icon → user triggers `download-update` → `install-update` runs NSIS silently and relaunches.

## Conventions (important — follow without asking)

- **Version bumps happen automatically with every change**, following SemVer. Don't ask before bumping `version` in `package.json` — just do it as part of the change.
- **Update `CHANGELOG.md` with every version bump.** Look at existing entries for the expected format (`## vX.Y.Z` heading, then a `### <category>` subheading, then bullet points — bold lede per bullet, plain-language description).
- Commit messages follow the pattern `vX.Y.Z - <short description>` (see `git log` for examples).
- Releases are pushed frequently in small increments — prefer many small version bumps over batching changes into one release.
- No test suite currently exists. There's no linter configured either — match the existing code style in `src/index.html` (2-space indent, `function` declarations, minimal external deps).

## Key files

```
main.js                 # Electron main process, IPC handlers, Anthropic calls, auto-updater
preload.js               # contextBridge — renderer-facing API surface
src/index.html           # entire UI: board, sidebar, command bar, all drawers/modals
electron-builder.yml      # build/publish config (NSIS, GitHub publish target)
package.json              # version (bump this every change), scripts, electron-updater config
CHANGELOG.md               # update every version bump
BUILD.md / SETUP.md         # end-user-facing build/setup docs — not for you unless asked to edit them
```

## Things to be careful about

- This app only targets Windows (NSIS/win builds) — don't introduce cross-platform assumptions unless asked.
- `dist/` is gitignored and machine-generated — never edit or commit files there.
- Don't run `npm run publish` unless explicitly asked — it cuts a real public GitHub release visible to testers.
