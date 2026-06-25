const { app, BrowserWindow, ipcMain, nativeImage, shell } = require('electron');
const path = require('path');
const fs   = require('fs');
const https = require('https');

// ── Paths ─────────────────────────────────────────────────────────────────────
const USER_DATA_DIR = app.getPath('userData');
const CONFIG_PATH   = path.join(USER_DATA_DIR, 'config.json');
const DATA_PATH     = path.join(USER_DATA_DIR, 'tasks.json');

// ── App metadata ──────────────────────────────────────────────────────────────
const PKG         = require('./package.json');
const APP_VERSION = PKG.version;                      // e.g. "1.1.0"
const GH_OWNER    = PKG.updater?.githubOwner || '';   // set in package.json
const GH_REPO     = PKG.updater?.githubRepo  || '';

// ── Config / data helpers ─────────────────────────────────────────────────────
function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); }
  catch { return {}; }
}
function saveConfig(data) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
}
function loadTasks() {
  try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')); }
  catch { return []; }
}
function saveTasks(tasks) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(tasks, null, 2));
}

// ── Icon helpers ──────────────────────────────────────────────────────────────
function iconPath(theme) {
  const file = (theme === 'dark') ? 'icon-dark.ico' : 'icon-light.ico';
  return path.join(__dirname, 'assets', file);
}

// ── Semver comparison ─────────────────────────────────────────────────────────
function isNewer(remote, local) {
  // Strips leading 'v' from tag names like "v1.2.0"
  const parse = v => v.replace(/^v/, '').split('.').map(Number);
  const [rMaj, rMin, rPat] = parse(remote);
  const [lMaj, lMin, lPat] = parse(local);
  if (rMaj !== lMaj) return rMaj > lMaj;
  if (rMin !== lMin) return rMin > lMin;
  return rPat > lPat;
}

// ── Update check ──────────────────────────────────────────────────────────────
function checkForUpdates(win) {
  if (!GH_OWNER || GH_OWNER === 'GITHUB_USERNAME' || !GH_REPO) return;

  const options = {
    hostname: 'api.github.com',
    path: `/repos/${GH_OWNER}/${GH_REPO}/releases/latest`,
    method: 'GET',
    headers: {
      'User-Agent': `Flowboard/${APP_VERSION}`,
      'Accept': 'application/vnd.github+json',
    },
  };

  https.get(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const release = JSON.parse(data);
        const tag = release.tag_name;           // e.g. "v1.2.0"
        const url = release.html_url;           // releases page URL
        if (tag && isNewer(tag, APP_VERSION)) {
          // Notify renderer — it will show the update button
          win.webContents.send('update-available', { version: tag, url });
        }
      } catch { /* silently ignore parse errors */ }
    });
  }).on('error', () => { /* silently ignore network errors */ });
}

// ── Window ────────────────────────────────────────────────────────────────────
let mainWindow;

function createWindow() {
  const savedTheme = loadConfig().theme || 'light';

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    backgroundColor: savedTheme === 'dark' ? '#0F1117' : '#F0F2F7',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: iconPath(savedTheme),
    show: false,
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Check for updates a few seconds after launch so it doesn't block startup
    setTimeout(() => checkForUpdates(mainWindow), 3000);
  });

  mainWindow.on('maximize',   () => mainWindow.webContents.send('window-maximized'));
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window-unmaximized'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── IPC handlers ──────────────────────────────────────────────────────────────
ipcMain.handle('get-config',  ()          => loadConfig());
ipcMain.handle('save-config', (_, data)   => { saveConfig(data); return true; });
ipcMain.handle('get-tasks',   ()          => loadTasks());
ipcMain.handle('save-tasks',  (_, tasks)  => { saveTasks(tasks); return true; });

ipcMain.handle('window-minimize', () => mainWindow.minimize());
ipcMain.handle('window-maximize', () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.handle('window-close', () => mainWindow.close());

ipcMain.handle('set-theme-icon', (_, theme) => {
  mainWindow.setIcon(nativeImage.createFromPath(iconPath(theme)));
  return true;
});

// Open update URL in default browser
ipcMain.handle('open-external', (_, url) => {
  shell.openExternal(url);
  return true;
});

// Expose current version to renderer
ipcMain.handle('get-version', () => APP_VERSION);

ipcMain.handle('call-anthropic', async (_, { apiKey, prompt, system }) => {
  return new Promise((resolve, reject) => {
    const systemPrompt = system || 'Return only valid JSON. No markdown, no preamble.';
    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          const text = parsed.content?.find(b => b.type === 'text')?.text || '[]';
          resolve(text.replace(/```json|```/g, '').trim());
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
});
