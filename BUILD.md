# Building the Flowboard Installer

Running `npm run build` on your machine produces a proper Windows installer:
`Flowboard Setup 1.0.0.exe`

When a user runs it, Flowboard will:
- Install to `C:\Users\<name>\AppData\Local\Programs\Flowboard\`
- Create a **desktop shortcut** with the Flowboard icon
- Create a **Start Menu** entry under Flowboard
- Appear in **Add or Remove Programs** with publisher, version, and uninstall option
- Leave user data (cards, tags, API key) untouched on uninstall

No admin rights required — installs per-user without a UAC prompt.

---

## Prerequisites

Node.js and Git must be installed (see SETUP.md if not done yet).

---

## Build steps

Open a Command Prompt in your `flowboard` folder and run these in order:

```
git pull
npm install
npm run build
```

`npm install` takes 1–3 minutes the first time (downloads Electron, ~120MB).
`npm run build` takes 2–5 minutes (packages everything and creates the installer).

When it finishes you'll see:

```
  • building        target=NSIS file=dist\Flowboard Setup 1.0.0.exe
  • built           dist\Flowboard Setup 1.0.0.exe
```

---

## Running the installer

1. Open the `dist` folder inside your `flowboard` folder
2. Double-click `Flowboard Setup 1.0.0.exe`
3. Click **Install** on the dialog that appears
4. Flowboard installs and launches automatically

After that, launch Flowboard from:
- The **desktop shortcut**
- The **Start Menu** → Flowboard
- Search for "Flowboard" in the Windows search bar

---

## Rebuilding after updates

```
git pull
npm run build
```

Then run the new installer from `dist\`. It will update the existing installation
in place. Your cards, tags, and API key in AppData are never touched.

---

## Distributing to others

Share the `dist\Flowboard Setup 1.0.0.exe` file. Recipients just run it —
no Node.js, no Git, no command line required on their end.

Each user's data (cards, tags, API key) is stored in their own Windows user
profile at `AppData\Roaming\flowboard\` — completely separate per user.

---

## Notes

- The `dist\` folder is gitignored — don't commit it
- The installer is ~80–120MB because it bundles a full Chromium browser (Electron)
- `deleteAppDataOnUninstall: false` in package.json ensures user data survives uninstall
- To change the version number, update `"version"` in package.json before building
