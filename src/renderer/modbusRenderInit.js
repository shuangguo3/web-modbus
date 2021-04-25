/**
 * 当前在渲染进程内，初始化modbus服务
 * 比如设置事件监听，当有新的modbus tcp连接时，在store增加connectionId
 */

import { ipcRenderer } from 'electron';

function modbusRenderInit(vueInstance) {
  console.log('store modbus');
  ipcRenderer.on('modbus', (event, msg, params) => {
    console.log('modbus', msg, params); // Prints 'whoooooooh!'

    let log,
      connectionId,
      connectionList;
    switch (msg) {

      // 客户端close
      case 'onEnd':

        connectionList = params.connectionList;
        connectionId = `${params.ip}:${params.port}`;
        log = `${connectionId} closed`;
        console.log(log);

        vueInstance.$store.dispatch('closeConnection', { connectionList });
        break;

      // 客户端已连接
      case 'onConnection':

        connectionList = params.connectionList;
        connectionId = `${params.ip}:${params.port}`;
        log = `${connectionId} connected`;
        console.log(log);

        // 设置store的connectionList
        vueInstance.$store.dispatch('newConnection', { connectionList });

        break;

      default:
        break;
    }
  });

}
export default modbusRenderInit;
