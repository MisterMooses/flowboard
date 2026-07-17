---
description: Bump version, update CHANGELOG.md, commit, and optionally publish a GitHub release
argument-hint: [short description of the change]
---

You are cutting a release for Flowboard following the project's existing workflow (see CLAUDE.md).

The change being released: $ARGUMENTS

Do the following, in order:

1. Run `git status` and `git diff` to see what's actually changed. If nothing is staged/modified and no description was given, ask what this release covers before continuing.
2. Read the current `version` in `package.json` and decide the SemVer bump (patch for fixes/small tweaks, minor for new features, major only if explicitly told it's breaking). Don't ask — decide and proceed, per project convention.
3. Update `version` in `package.json` to the new version.
4. Add a new entry at the top of `CHANGELOG.md`, matching the existing format exactly: a `## vX.Y.Z` heading, then a `### <category>` subheading (e.g. "New Features", "Bug Fixes & Improvements", "Changes & Fixes"), then bullet points with a **bold lede** followed by a plain-language description. Base the entry on the actual diff, not just the description given.
5. Stage the relevant files and commit with the message `vX.Y.Z - <short description>` (lowercase, matching the style in `git log`).
6. Stop and tell me the new version number and changelog entry. Ask whether I also want to run `npm run publish` now (this builds the Windows installer and cuts a real public GitHub release — don't run it without explicit confirmation).
7. If confirmed, run `npm run publish`.
