const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('flowboard', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (data) => ipcRenderer.invoke('save-config', data),
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  saveTasks: (tasks) => ipcRenderer.invoke('save-tasks', tasks),
  callAnthropic: (opts) => ipcRenderer.invoke('call-anthropic', opts),
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  onMaximizeChange: (cb) => {
    ipcRenderer.on('window-maximized', () => cb(true));
    ipcRenderer.on('window-unmaximized', () => cb(false));
  },
});
