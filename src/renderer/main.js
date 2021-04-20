import Vue from 'vue';

import App from './App';
import router from './router';
import store from './store';
// 引用element
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './permission';
// 日志
import './error';
import './icons';
import '@/styles/index.scss';

import modbusInit from './modbusInit.js';

if (!process.env.IS_WEB) {
  if (!require('../../config').IsUseSysTitle) {
    require('@/styles/custom-title.scss');
  }
  // 当处于electron状态下才引用db
  Vue.prototype.$ipcApi = require('./utils/ipcRenderer').default;
}

Vue.use(ElementUI);

Vue.config.productionTip = false;
/* eslint-disable no-new */
const vue = new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');

// 在渲染进程内进行modbus初始化，比如设置事件监听，当有新的modbus tcp连接时，在store增加connectionId
modbusInit(vue);

export default vue;
