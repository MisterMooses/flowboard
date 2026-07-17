const { app, BrowserWindow, ipcMain, nativeImage, shell } = require('electron');
const path   = require('path');
const fs     = require('fs');
const https  = require('https');
const { autoUpdater } = require('electron-updater');

// ── Paths ─────────────────────────────────────────────────────────────────────
const USER_DATA_DIR = app.getPath('userData');
const CONFIG_PATH   = path.join(USER_DATA_DIR, 'config.json');
const DATA_PATH     = path.join(USER_DATA_DIR, 'tasks.json');

// ── App metadata ──────────────────────────────────────────────────────────────
const PKG         = require('./package.json');
const APP_VERSION = PKG.version;

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

// ── Changelog helper ──────────────────────────────────────────────────────────
function loadChangelog() {
  try {
    const p = path.join(__dirname, 'CHANGELOG.md');
    return fs.readFileSync(p, 'utf8');
  } catch { return ''; }
}

// ── Icon helper ───────────────────────────────────────────────────────────────
function iconPath() {
  return path.join(__dirname, 'assets', 'icon.ico');
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
    icon: iconPath(),
    show: false,
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    setupAutoUpdater();
  });

  mainWindow.on('maximize',   () => mainWindow.webContents.send('window-maximized'));
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window-unmaximized'));
}

// ── Auto-updater ──────────────────────────────────────────────────────────────
function setupAutoUpdater() {
  // Allow unsigned updates for testing — remove when code signing is set up
  autoUpdater.forceDevUpdateConfig = false;

  // Don't auto-download — let the user trigger the download from the UI
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('update-available', {
      version: `v${info.version}`,
      releaseNotes: info.releaseNotes || '',
    });
  });

  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('download-progress', {
      percent: Math.round(progress.percent),
      received: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-downloaded');
  });

  autoUpdater.on('error', (err) => {
    // Silently ignore — update check failing shouldn't surface to user
    console.error('[updater] error:', err.message);
  });

  // Check 3 seconds after launch
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, 3000);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── IPC handlers ──────────────────────────────────────────────────────────────
ipcMain.handle('get-config',    ()         => loadConfig());
ipcMain.handle('save-config',   (_, data)  => { saveConfig(data); return true; });
ipcMain.handle('get-tasks',     ()         => loadTasks());
ipcMain.handle('save-tasks',    (_, tasks) => { saveTasks(tasks); return true; });
ipcMain.handle('get-version',   ()         => APP_VERSION);
ipcMain.handle('get-changelog', ()         => loadChangelog());

ipcMain.handle('window-minimize', () => mainWindow.minimize());
ipcMain.handle('window-maximize', () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.handle('window-close', () => mainWindow.close());

ipcMain.handle('set-theme-icon', (_, theme) => {
  mainWindow.setIcon(nativeImage.createFromPath(iconPath()));
  return true;
});

ipcMain.handle('open-external', (_, url) => {
  shell.openExternal(url);
  return true;
});

// Trigger download via electron-updater
ipcMain.handle('download-update', () => {
  autoUpdater.downloadUpdate().catch(() => {});
  return true;
});

// Install update and restart
ipcMain.handle('install-update', () => {
  // isSilent=true skips NSIS prompts, isForceRunAfter=true relaunches app
  // Small delay lets the renderer splash finish fading in before we quit
  setTimeout(() => {
    autoUpdater.quitAndInstall(true, true);
  }, 600);
});

ipcMain.handle('call-anthropic', async (_, { apiKey, prompt, system }) => {
  return new Promise((resolve, reject) => {
    const systemPrompt = system || 'Return only valid JSON. No markdown, no preamble.';
    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
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
          const textBlock = parsed.content?.find(b => b.type === 'text');
          if (!textBlock) return reject(new Error('AI response contained no text — try again.'));
          resolve(textBlock.text.replace(/```json|```/g, '').trim());
        } catch (e) { reject(e); }
      });
    });
    req.setTimeout(30000, () => req.destroy(new Error('Request to Anthropic API timed out — try again.')));
    req.on('error', reject);
    req.write(body);
    req.end();
  });
});
