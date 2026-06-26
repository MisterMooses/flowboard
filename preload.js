const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('flowboard', {
  getConfig:      ()        => ipcRenderer.invoke('get-config'),
  saveConfig:     (data)    => ipcRenderer.invoke('save-config', data),
  getTasks:       ()        => ipcRenderer.invoke('get-tasks'),
  saveTasks:      (tasks)   => ipcRenderer.invoke('save-tasks', tasks),
  callAnthropic:  (opts)    => ipcRenderer.invoke('call-anthropic', opts),
  minimize:       ()        => ipcRenderer.invoke('window-minimize'),
  maximize:       ()        => ipcRenderer.invoke('window-maximize'),
  close:          ()        => ipcRenderer.invoke('window-close'),
  setThemeIcon:   (theme)   => ipcRenderer.invoke('set-theme-icon', theme),
  openExternal:   (url)     => ipcRenderer.invoke('open-external', url),
  getVersion:     ()        => ipcRenderer.invoke('get-version'),
  getChangelog:   ()        => ipcRenderer.invoke('get-changelog'),
  downloadUpdate: ()        => ipcRenderer.invoke('download-update'),
  installUpdate:  ()        => ipcRenderer.invoke('install-update'),

  onMaximizeChange: (cb) => {
    ipcRenderer.on('window-maximized',   () => cb(true));
    ipcRenderer.on('window-unmaximized', () => cb(false));
  },
  onUpdateAvailable: (cb) => {
    ipcRenderer.on('update-available', (_, info) => cb(info));
  },
  onDownloadProgress: (cb) => {
    ipcRenderer.on('download-progress', (_, info) => cb(info));
  },
  onUpdateDownloaded: (cb) => {
    ipcRenderer.on('update-downloaded', () => cb());
  },
});
