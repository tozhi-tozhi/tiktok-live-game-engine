const { app, BrowserWindow, dialog } = require('electron');
const { startServer } = require('./server');

let mainWindow = null;
let server = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  mainWindow.loadURL(`http://localhost:${server.port}/hub.html`);
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(async () => {
  try {
    server = await startServer();
    createWindow();
  } catch (err) {
    dialog.showErrorBox('เริ่มเซิร์ฟเวอร์ไม่ได้', `${err.message}\n\n(พอร์ต 3000 อาจถูกโปรแกรมอื่นใช้อยู่)`);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (server) server.close();
  app.quit();
});