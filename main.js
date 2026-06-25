const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');
const DATA_PATH = path.join(app.getPath('userData'), 'tasks.json');

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

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    backgroundColor: '#0F1117',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-config', () => loadConfig());
ipcMain.handle('save-config', (_, data) => { saveConfig(data); return true; });
ipcMain.handle('get-tasks', () => loadTasks());
ipcMain.handle('save-tasks', (_, tasks) => { saveTasks(tasks); return true; });

ipcMain.handle('window-minimize', () => mainWindow.minimize());
ipcMain.handle('window-maximize', () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.handle('window-close', () => mainWindow.close());

ipcMain.handle('call-anthropic', async (_, { apiKey, prompt }) => {
  return new Promise((resolve, reject) => {
    const today = new Date().toISOString().split('T')[0];
    const systemPrompt = `You are a task parser for a Kanban board. Given natural language input, extract one or more tasks and return ONLY a JSON array. No preamble, no markdown, just raw JSON.

Each task object must have:
- "title": string (concise task name, max 80 chars)
- "column": one of "backlog" | "next" | "progress" | "done"
  - Use "progress" if the user says they are actively working on it
  - Use "next" for high priority or tasks due soon (within a week)
  - Use "backlog" for low priority or no clear deadline
  - Use "done" if they say it is completed
- "priority": one of "low" | "medium" | "high" | "critical"
- "due": ISO date string (YYYY-MM-DD) if mentioned, else null. Today is ${today}. Interpret relative dates (tomorrow, next Monday, end of week, etc.)
- "tags": array of 1-3 tags from: work, design, meeting, research, writing, planning, review, email, code, admin, personal, finance, health, learning, urgent, other

Be smart about inferring priority and column from context. Multiple tasks can come from one input.`;

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
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
});
