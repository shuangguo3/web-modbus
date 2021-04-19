import config from '@config';
const ModbusTcp = require('../../modbus/tcp');

function initModbusTcp() {
  // 启动modbus tcp服务器，并且保存在全局变量global
  global.modbusTcp = new ModbusTcp({
    onConnection(ip, port) {

      console.log('initModbusTcp onConnection');
      global.windowList.mainWindow.webContents.send(
        'modbus',
        'onConnection',
        {
          ip, port,
        }
      );

    },
  });
  // 必须先主动listen（作为server）或者connect（作为client）
  global.modbusTcp.listen(config.ModbusTcpListenPort);

}
export default initModbusTcp;
