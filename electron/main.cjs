const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');

// 在应用启动前禁用沙盒
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-setuid-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('disable-software-rasterizer');

// 设置唯一的数据存储路径，避免冲突
const userDataPath = path.join(app.getPath('appData'), 'aha-okr-1.3');
app.setPath('userData', userDataPath);
console.log('[Electron] User data path:', userDataPath);

// 保持窗口对象的全局引用，防止被垃圾回收
let mainWindow = null;

function createWindow() {
  // 创建浏览器窗口 - 使用 macOS 原生标题栏
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      sandbox: false,
    },
    // 使用 macOS 原生标题栏，但隐藏标题文字
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    transparent: true,
    backgroundColor: '#00000000',
  });

  // 加载应用 - 使用 setTimeout 确保 Vite 服务器完全 ready
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  
  setTimeout(() => {
    if (devServerUrl) {
      console.log('[Electron] Loading dev URL:', devServerUrl);
      mainWindow.loadURL(devServerUrl);
      mainWindow.webContents.openDevTools();
    } else {
      console.log('[Electron] Loading production build');
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
  }, 1000); // 强制延迟 1000ms

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Electron 初始化完成
app.whenReady().then(() => {
  // 清除存储配额限制
  session.defaultSession.clearStorageData({
    storages: ['cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage']
  }).then(() => {
    console.log('[Electron] Storage data cleared');
    createWindow();
  }).catch((err) => {
    console.error('[Electron] Failed to clear storage:', err);
    createWindow();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
