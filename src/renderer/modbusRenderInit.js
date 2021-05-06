/**
 * 当前在渲染进程内，初始化modbus服务
 * 比如设置事件监听，当有新的modbus tcp连接时，在store增加connectionId
 */

import { ipcRenderer } from 'electron';

function modbusRenderInit(vueInstance) {
  console.log('store modbus');

  // 处理全局的modbus事件
  ipcRenderer.on('modbus', (event, msg, params) => {
    console.log('modbus', msg, params); // Prints 'whoooooooh!'

    let log,
      serverPort,
      connectionId,
      connectionList;
    switch (msg) {

      // 客户端close
      case 'onClose':

        connectionList = params.connectionList;
        connectionId = `${params.ip}:${params.port}`;
        log = `${connectionId} closed`;
        console.log(log);

        // vuex modbus 没有命名空间，namespaced: false
        vueInstance.$store.dispatch('modbusConnection', { connectionList });
        break;

      // 客户端已连接
      case 'onConnection':

        connectionList = params.connectionList;
        connectionId = `${params.ip}:${params.port}`;
        log = `${connectionId} connected`;
        console.log(log);

        // vuex modbus 没有命名空间，namespaced: false
        vueInstance.$store.dispatch('modbusConnection', { connectionList });

        break;

      // server 启动成功
      case 'onStartServer':

        serverPort = params.serverPort;
        // vuex modbus 没有命名空间，namespaced: false
        vueInstance.$store.dispatch('modbusServer', { serverPort });
        break;

      // server已关闭
      case 'onCloseServer':
        // vuex modbus 没有命名空间，namespaced: false
        vueInstance.$store.dispatch('modbusServer', { serverPort: null });
        break;

      default:
        break;
    }
  });

}
export default modbusRenderInit;
