const { app, BrowserWindow, ipcMain, nativeImage, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

const USER_DATA_DIR = app.getPath('userData');
const CONFIG_PATH = path.join(USER_DATA_DIR, 'config.json');
const DATA_PATH   = path.join(USER_DATA_DIR, 'tasks.json');

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

function iconPath(theme) {
  const file = (theme === 'dark') ? 'icon-dark.ico' : 'icon-light.ico';
  return path.join(__dirname, 'assets', file);
}

let mainWindow;

function createWindow() {
  // Read saved theme so the correct icon is shown from the very first frame
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
  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.on('maximize',   () => mainWindow.webContents.send('window-maximized'));
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window-unmaximized'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-config',  () => loadConfig());
ipcMain.handle('save-config', (_, data) => { saveConfig(data); return true; });
ipcMain.handle('get-tasks',   () => loadTasks());
ipcMain.handle('save-tasks',  (_, tasks) => { saveTasks(tasks); return true; });

ipcMain.handle('window-minimize', () => mainWindow.minimize());
ipcMain.handle('window-maximize', () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.handle('window-close', () => mainWindow.close());

// Swap taskbar icon when the user toggles theme
ipcMain.handle('set-theme-icon', (_, theme) => {
  const icon = nativeImage.createFromPath(iconPath(theme));
  mainWindow.setIcon(icon);
  return true;
});

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
