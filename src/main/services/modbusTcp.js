/**
 * 当前在主进程内，启动modbus tcp 服务
 */

import config from '@config';
const ModbusTcp = require('../../modbus/tcp');

function initModbusTcp() {
  // 启动modbus tcp服务器，并且保存在全局变量global
  global.modbusTcp = new ModbusTcp({

    // 把已连接的所有connectionList发给渲染进程，避免丢失掉在渲染进程监听前收到的连接
    onConnection(ip, port, connectionList) {

      console.log('initModbusTcp onConnection');
      global.windowList.mainWindow.webContents.send(
        'modbus',
        'onConnection',
        {
          ip, port, connectionList,
        }
      );

    },

    // 把已连接的所有connectionList发给渲染进程，避免丢失掉在渲染进程监听前收到的连接
    onEnd(ip, port, connectionList) {

      console.log('initModbusTcp onEnd');
      global.windowList.mainWindow.webContents.send(
        'modbus',
        'onEnd',
        {
          ip, port, connectionList,
        }
      );

    },
  });
  // 必须先主动listen（作为server）或者connect（作为client）
  global.modbusTcp.listen(config.ModbusTcpListenPort);

}
export default initModbusTcp;
