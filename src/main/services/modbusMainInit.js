/**
 * 当前在主进程内，启动modbus tcp 服务
 */

import config from '@config';
const ModbusTcp = require('../../modbus/tcp');

// modbus在主进程内的初始化
function modbusMainInit() {
  // 启动modbus tcp服务器，并且保存在全局变量global
  global.modbusTcp = new ModbusTcp({

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

    // 把已连接的所有connectionList发给渲染进程，避免丢失掉在渲染进程监听前收到的连接
    onEnd(host, port, connectionList) {

      console.log('modbusMainInit onEnd');
      global.windowList.mainWindow.webContents.send(
        'modbus',
        'onEnd',
        {
          host, port, connectionList,
        }
      );

    },
  });
  // 必须先主动listen（作为server）或者connect（作为client）
  global.modbusTcp.listen(config.ModbusTcpListenPort);

  // 作为client连接
  // global.modbusTcp.connect('127.0.0.1', 502);

}
export default modbusMainInit;
