const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveGame: (data) => ipcRenderer.invoke('gravel-sky:save', data),
  loadGame: () => ipcRenderer.invoke('gravel-sky:load'),
});
