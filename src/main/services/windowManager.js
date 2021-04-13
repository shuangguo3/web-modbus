import { BrowserWindow, Menu } from 'electron';
import menuconfig from '../config/menu';
import config from '@config';
import setIpc from './ipcMain';
import upload from './checkupdate';
import DownloadUpdate from './downloadFile';
import { winURL, loadingURL } from '../config/StaticPath';

let loadWindow = null;
let mainWindow = null;

let isMainWindowReady = false;
let isStartupReady = false;

function createMainWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 1700,
    minWidth: 1366,
    show: false,

    frame: config.IsUseSysTitle,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      // 如果是开发模式可以使用devTools
      devTools: process.env.NODE_ENV === 'development',
      // devTools: true,
      // 在macos中启用橡皮动画
      scrollBounce: process.platform === 'darwin',
    },

  });
  // 这里设置只有开发环境才注入显示开发者模式
  if (process.env.NODE_ENV === 'development') {
    menuconfig.push({
      label: '开发者设置',
      submenu: [
        {
          label: '切换到开发者模式',
          accelerator: 'CmdOrCtrl+I',
          role: 'toggledevtools',
        },
      ],
    });
  }
  // 载入菜单
  const menu = Menu.buildFromTemplate(menuconfig);
  Menu.setApplicationMenu(menu);
  mainWindow.loadURL(winURL);

  setIpc.Mainfunc(mainWindow, config.IsUseSysTitle);
  upload.Update(mainWindow);
  DownloadUpdate.download(mainWindow);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools(true);
  }
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 在全局变量保存主窗口
  global.windowList.mainWindow = mainWindow;

  mainWindow.webContents.once('ready-to-show', () => {
    isMainWindowReady = true;
    if (isStartupReady) {
      mainWindow.show();
      if (config.UseStartupChart) loadWindow.destroy();
    }
  });

  /*
  setInterval(() => {
    console.log('setInterval');
    global.windowList.mainWindow.webContents.send('modbus', 'connect', JSON.stringify({ aaa: 'aaa' }));
  }, 5000);
  */

}

function loadingWindow() {

  loadWindow = new BrowserWindow({
    width: 400,
    height: 600,
    frame: false,

    backgroundColor: '#222',
    skipTaskbar: true,
    transparent: true,
    resizable: false,
    webPreferences: { experimentalFeatures: true },
  });
  loadWindow.loadURL(loadingURL);
  loadWindow.show();
  loadWindow.on('closed', () => {
    loadWindow = null;
  });

  createMainWindow();
  setTimeout(() => {
    isStartupReady = true;
    if (isMainWindowReady) {
      mainWindow.show();
      if (config.UseStartupChart) loadWindow.destroy();
    }
  }, 2000);


}

function initWindow() {
  if (config.UseStartupChart) {
    return loadingWindow();
  }
  return createMainWindow();

}
export default initWindow;
