const { app, BrowserWindow, ipcMain, nativeImage, shell } = require('electron');
const path = require('path');
const fs   = require('fs');
const https = require('https');
const os   = require('os');
const { exec } = require('child_process');

// ── Paths ─────────────────────────────────────────────────────────────────────
const USER_DATA_DIR = app.getPath('userData');
const CONFIG_PATH   = path.join(USER_DATA_DIR, 'config.json');
const DATA_PATH     = path.join(USER_DATA_DIR, 'tasks.json');

// ── App metadata ──────────────────────────────────────────────────────────────
const PKG         = require('./package.json');
const APP_VERSION = PKG.version;                      // e.g. "1.1.0"
const GH_OWNER    = PKG.updater?.githubOwner || '';   // set in package.json
const GH_REPO     = PKG.updater?.githubRepo  || '';

// ── Secrets (gitignored) ──────────────────────────────────────────────────────
let GH_TOKEN = '';
try {
  const secrets = require('./secrets.json');
  GH_TOKEN = secrets.githubToken || '';
} catch { /* secrets.json not present — unauthenticated requests only */ }

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
  return path.join(__dirname, 'assets', 'icon.ico');
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
      ...(GH_TOKEN ? { 'Authorization': `token ${GH_TOKEN}` } : {}),
    },
  };

  https.get(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const release = JSON.parse(data);
        const tag = release.tag_name;
        const pageUrl = release.html_url;
        if (!tag || !isNewer(tag, APP_VERSION)) return;
        // Find the .exe installer asset
        const assets = release.assets || [];
        const exeAsset = assets.find(a => a.name.endsWith('.exe'));
        win.webContents.send('update-available', {
          version: tag,
          url: pageUrl,
          downloadUrl: exeAsset ? exeAsset.browser_download_url : null,
          fileSize: exeAsset ? exeAsset.size : null,
        });
      } catch (e) { /* silently ignore */ }
    });
  }).on('error', () => { /* silently ignore */ });
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

// Download installer and launch it
ipcMain.handle('download-update', (_, { downloadUrl, version }) => {
  return new Promise((resolve, reject) => {
    const fileName = `Flowboard-Setup-${version}.exe`;
    const destPath = path.join(os.tmpdir(), fileName);

    const file = fs.createWriteStream(destPath);
    let received = 0;

    function doGet(url) {
      https.get(url, { headers: { 'User-Agent': `Flowboard/${APP_VERSION}` } }, (res) => {
        // Follow redirects (GitHub asset URLs redirect to S3)
        if (res.statusCode === 302 || res.statusCode === 301) {
          file.close();
          return doGet(res.headers.location);
        }
        const total = parseInt(res.headers['content-length'] || '0', 10);
        res.on('data', (chunk) => {
          received += chunk.length;
          file.write(chunk);
          if (total > 0) {
            mainWindow.webContents.send('download-progress', {
              percent: Math.round(received / total * 100),
              received,
              total,
            });
          }
        });
        res.on('end', () => {
          file.end();
          file.on('finish', () => {
            // Tell renderer we're installing before we quit
            try { win.webContents.send('update-installing'); } catch {}
            // Launch installer then quit — NSIS will handle the rest
            exec(`"${destPath}"`);
            setTimeout(() => app.quit(), 1500);
            // Resolve immediately — app.quit racing the promise is fine
            resolve({ success: true, path: destPath });
          });
        });
        res.on('error', reject);
      }).on('error', reject);
    }

    doGet(downloadUrl);
  });
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
