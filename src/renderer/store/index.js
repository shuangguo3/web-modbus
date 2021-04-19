import Vue from 'vue';
import Vuex from 'vuex';

import { ipcRenderer } from 'electron';

// 注释这个的原因是因为会导致vuex操作失败
// import { createPersistedState, createSharedMutations } from 'vuex-electron'

import modules from './modules';

import getters from './getters';
Vue.use(Vuex);

console.log('store modbus');
ipcRenderer.on('modbus', (event, msg, params, requestInfo) => {
  console.log('modbus', msg, params, requestInfo); // Prints 'whoooooooh!'

  let log;
  switch (msg) {

    // 客户端已连接
    case 'onConnection':
      console.log('connect'); // Prints 'whoooooooh!'

      log = `${params.ip}:${params.port} connected`;
      console.log(log);

      /*
      this.logDatas.push({
        time,
        log,
      });


      // 创建rtu
      ipcRenderer
        .invoke('modbus', 'createRtu', {
          //
          // 通信对端的ip和端口，标识唯一的通信信道
          ip: params.ip,
          port: params.port,
        })
        .then((result) => {
          this.modbusConnectionId = result;
          console.log('this.modbusConnectionId', this.modbusConnectionId);
        });
        */

      break;

    default:
      break;
  }
});

export default new Vuex.Store({
  modules,
  getters,
  // plugins: [
  //   createPersistedState(),
  //   createSharedMutations()
  // ],
  // strict: process.env.NODE_ENV !== 'production'
});
