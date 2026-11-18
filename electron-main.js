const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { startServer } = require('./server');

let mainWindow = null;

// Start backend (HTTP + WebSocket + TikTok) before opening the window
startServer().then(({ httpPort, wsPort }) => {
  console.log(`HTTP server on :${httpPort}, WS server on :${wsPort}`);
}).catch(err => {
  console.error('Failed to start server:', err);
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // optional, for future IPC
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Control panel runs inside Electron window
  mainWindow.loadURL('http://localhost:3000/control.html');
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});