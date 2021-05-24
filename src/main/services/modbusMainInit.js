/**
 * 当前在主进程内，启动modbus tcp 服务
 */

// import config from '@config';
import Store from 'electron-store';

const WtcpModbus = require('wtcp-modbus');

// modbus在主进程内的初始化
function modbusMainInit() {
  // 启动modbus tcp服务器，并且保存在全局变量global
  // global.modbusTcp = new ModbusTcp({
  global.wtcpModbus = new WtcpModbus.tcp({
    // 回调函数
    callbackList: {

      // 把已连接的所有connectionList发给渲染进程，避免丢失在渲染进程监听前收到的连接
      onConnection(host, port, connectionList) {

        console.log('modbusMainInit onConnection');
        global.windowList.mainWindow.webContents.send(
          'modbus',
          'onConnection',
          {
            host, port, connectionList,
          }
        );

      },

      // 连接关闭事件
      onClose(host, port, connectionList) {

        console.log('modbusMainInit onClose');
        global.windowList.mainWindow.webContents.send(
          'modbus',
          'onClose',
          {
            host, port, connectionList,
          }
        );

      },

      // server关闭事件
      onServerClose() {

        console.log('modbusMainInit onServerClose');
        global.windowList.mainWindow.webContents.send(
          'modbus',
          'onCloseServer'
        );

      },
    },
  });

  // 默认端口值
  let serverPort = 7777;
  const electronStore = new Store();
  if (electronStore.has('modbus.serverPort')) {
    serverPort = electronStore.get('modbus.serverPort');
  } else {
    electronStore.set('modbus.serverPort', serverPort);
  }

  // webModbus.getRtu('aaa');

}
export default modbusMainInit;
