---
description: Build the macOS dmg, install it to /Applications, and launch it
---

You are producing a local macOS test build of Flowboard and installing it for the user to try, following the `mac` build target added to `electron-builder.yml`. This is a local dev/test workflow, not a release — do NOT touch `package.json`'s version, `CHANGELOG.md`, or git.

Do the following, in order:

1. Run `npm run build:mac` from the repo root. If `node`/`npm` aren't on PATH, source nvm first (`source ~/.nvm/nvm.sh`) before retrying.
2. Find the newly built dmg in `dist/` (pattern `Flowboard-*.dmg` — there should be exactly one; if there are stale ones from previous builds, pick the most recently modified).
3. Quit any currently running copy of the app first, ignoring errors if it isn't running: `osascript -e 'quit app "Flowboard"'`.
4. Mount the dmg with `hdiutil attach <path-to-dmg>` and parse its output for the mount point (the `/Volumes/...` path in the last column).
5. Copy the new app over any existing one with `ditto "<mount>/Flowboard.app" /Applications/Flowboard.app` (ditto overwrites an existing bundle in place and preserves it correctly; plain `cp -R` can drop metadata). Don't `rm -rf` the old copy first — that's a destructive command outside the repo and gets denied by permission settings; `ditto` alone handles the overwrite.
6. Unmount the dmg: `hdiutil detach "<mount>"`.
7. Since these builds are unsigned (no Apple Developer ID configured yet — see CLAUDE.md), strip the quarantine attribute so it launches without a Gatekeeper prompt: `xattr -cr /Applications/Flowboard.app`.
8. Launch it: `open /Applications/Flowboard.app`.
9. Report the version that was built and installed (read it from `package.json`), and confirm it launched.
