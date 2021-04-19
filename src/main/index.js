

import { app } from 'electron';
import initWindow from './services/windowManager';
import DisableButton from './config/DisableButton';
import electronDevtoolsInstaller, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';

import initModbusTcp from './services/modbusTcp.js';

// 定义全局变量，保存创建的窗口列表
global.windowList = {};

async function onAppReady() {

  initModbusTcp();

  initWindow();
  DisableButton.Disablef12();
  if (process.env.NODE_ENV === 'development') {
    electronDevtoolsInstaller(VUEJS_DEVTOOLS)
      .then((name) => console.log(`installed: ${name}`))
      .catch(err => console.log('Unable to install `vue-devtools`: \n', err));
  }
}

app.isReady() ? onAppReady() : app.on('ready', onAppReady);
// 解决9.x跨域异常问题
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

app.on('window-all-closed', () => {
  // 所有平台均为所有窗口关闭就退出软件
  app.quit();
});
app.on('browser-window-created', () => {
  console.log('window-created');
});

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.removeAsDefaultProtocolClient('electron-vue-template');
    console.log('有于框架特殊性开发环境下无法使用');
  }
} else {
  app.setAsDefaultProtocolClient('electron-vue-template');
}
