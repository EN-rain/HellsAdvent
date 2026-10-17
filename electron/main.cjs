const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let latestSaveData = null;

function getSaveFilePath() {
  return path.join(app.getPath('userData'), 'gravel_sky_save.json');
}

function writeSaveToDisk(data) {
  if (!data) return false;
  try {
    const filePath = getSaveFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to write save file:', err);
    return false;
  }
}

function readSaveFromDisk() {
  try {
    const filePath = getSaveFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read save file:', err);
  }
  return null;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    title: 'GRAVEL SKY',
    backgroundColor: '#0B0D10',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.removeMenu();

  // F11 fullscreen handler
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
  if (!app.isPackaged) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.handle('gravel-sky:save', async (_event, data) => {
  latestSaveData = data;
  return writeSaveToDisk(data);
});

ipcMain.handle('gravel-sky:load', async () => {
  const loaded = readSaveFromDisk();
  if (loaded) latestSaveData = loaded;
  return loaded;
});

// Auto-save cached progress every 30s on main process side as well
setInterval(() => {
  if (latestSaveData) {
    writeSaveToDisk(latestSaveData);
  }
}, 30000);

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  if (latestSaveData) {
    writeSaveToDisk(latestSaveData);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
