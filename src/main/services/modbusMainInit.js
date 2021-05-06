/**
 * 当前在主进程内，启动modbus tcp 服务
 */

// import config from '@config';
const ModbusTcp = require('../../modbus/tcp');

// modbus在主进程内的初始化
function modbusMainInit() {
  // 启动modbus tcp服务器，并且保存在全局变量global
  global.modbusTcp = new ModbusTcp({
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


  const serverPort = 7777;
  // 必须先主动listen（作为server）或者connect（作为client）
  global.modbusTcp.listen(serverPort, () => {
    //

    console.log('listen success');
    global.windowList.mainWindow.webContents.send(
      'modbus',
      'onStartServer',
      { serverPort }
    );

  });

  // 作为client连接
  // global.modbusTcp.connect('127.0.0.1', 502);

}
export default modbusMainInit;
