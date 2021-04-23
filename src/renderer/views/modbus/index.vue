<template>

  <div>

    <el-tabs
      v-model="activeName"
      @tab-click="handleClick"
    >
      <el-tab-pane
        label="连接日志"
        name="log"
      >

        <el-table
          :data="logDatas"
          style="width: 100%"
        >
          <el-table-column
            label="时间"
            width="280"
          >
            <template slot-scope="scope">
              <i class="el-icon-time"></i>
              <span style="margin-left: 10px">{{ scope.row.time }}</span>
            </template>
          </el-table-column>
          <el-table-column label="日志">
            <template slot-scope="scope">
              {{ scope.row.log }}
            </template>
          </el-table-column>
        </el-table>

      </el-tab-pane>

      <el-tab-pane
        v-for="connectionId in modbusConnectionTabList"
        :key="connectionId"
        :label="connectionId"
        :name="connectionId"
      >

        <el-button
          type="primary"
          round
          @click="readHoldingRegisters"
        >开始读寄存器</el-button>

        <el-table
          :data="regDatas[connectionId]"
          style="width: 100%"
        >
          <el-table-column label="地址">
            <template slot-scope="scope">
              0x{{ scope.row.regAddr }}
            </template>
          </el-table-column>
          <el-table-column label="16进制值">
            <template slot-scope="scope">
              0x{{ scope.row.valueOf16 }}
            </template>
          </el-table-column>
          <el-table-column label="10进制值">
            <template slot-scope="scope">
              {{ scope.row.valueOf10 }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

    </el-tabs>

  </div>

</template>

<script>
//const { ipcRenderer } = require('electron');
import { ipcRenderer } from 'electron';

import jsUtil from '@/utils/jsUtil.js';

export default {
  name: 'AlarmPage',

  data() {
    return {
      //modbusConnection: '',
      modbusConnection: null,

      modbusConnectionTabList: [],
      regDataList: {},
      regDatas: {},

      activeName: 'log',
      //网络通讯日志
      logDatas: [
        {
          time: '2016-05-02',
          log: '初始化',
        },
      ],
    };
  },

  watch: {
    '$store.state.modbus.connectionList': {
      immediate: true,
      handler(modbusConnectionList) {
        console.log('watch modbusConnectionList', modbusConnectionList);
        this.modbusConnectionTabList = modbusConnectionList;

        for (const modbusConnectionId in modbusConnectionList) {
          if (!this.regDataList[modbusConnectionId]) {
            this.regDataList[modbusConnectionId] = {};
          }
          if (!this.regDatas[modbusConnectionId]) {
            this.regDatas[modbusConnectionId] = [];
          }
        }
      },
    },
  },

  methods: {
    testToken() {
      this.$store.commit('SET_TOKEN', 'test111');
    },

    handleClick(tab, event) {
      console.log(tab, event);
      console.log(tab.name, tab.label);
      this.modbusConnection = this.modbusConnectionTabList[tab.name];
    },

    readHoldingRegisters() {
      ipcRenderer.invoke('modbus', 'ReadHoldingRegisters', {
        ip: this.modbusConnection.ip,
        // 当明确对端ip下，只有一个连接时，可以忽略port
        // port: this.modbusConnection.port,

        slaveAddr: 0x01,
        regAddr: 0x8008,
        regQuantity: 6,
        /*
        callback: (requestInfo) => {
          console.log('callback', requestInfo);
        },
        errorCallback(errorCode, requestInfo) {
          console.log('errorCallback', errorCode, requestInfo);
        },
        */
      });
    },
  },

  created: function () {
    // 主动去获取一次modbus连接列表，避免渲染进程未启动时，遗漏主进程已经收到了连接
    ipcRenderer
      .invoke('modbus', 'getConnectionList')
      .then((modbusConnectionList) => {
        console.log(modbusConnectionList);
        this.modbusConnectionTabList = modbusConnectionList;
      });

    ipcRenderer.on('modbus', (event, msg, params, requestInfo) => {
      console.log('modbus', msg, params, requestInfo);

      let time, log;

      switch (msg) {
        case 'onReadHoldingRegisters':
          console.log('this.regDatas', this.regDatas);
          console.log('requestInfo', requestInfo);

          //regDataList = this.regDataList;
          const regDatas = this.regDatas[requestInfo.connectionId];
          const regDataList = this.regDataList[requestInfo.connectionId];

          for (let regAddr in params) {
            const regValue = params[regAddr];

            // 检查去重

            if (regDataList[regAddr] === regValue) {
              continue;
            }
            regDataList[regAddr] = regValue;

            //json 的key一定是string类型，需要转化为number类型，才能使用toString函数
            regAddr = Number(regAddr);

            regDatas.push({
              regAddr: regAddr.toString(16),
              valueOf16: regValue.toString(16),
              valueOf10: regValue.toString(),
            });
          }
          //hex.toString(16)
          console.log('this.regDatas', this.regDatas);

          this.regDatas = this.regDatas;
          this.regDataList = this.regDataList;
          break;

        // 客户端已连接
        case 'onConnection':
          console.log('connect'); // Prints 'whoooooooh!'
          time = jsUtil.timestampToTime(new Date().getTime());
          log = `${params.ip}:${params.port} connected`;
          this.logDatas.push({
            time,
            log,
          });
          break;

        // 客户端关闭
        case 'onEnd':
          console.log('end'); // Prints 'whoooooooh!'
          time = jsUtil.timestampToTime(new Date().getTime());
          log = `${params.ip}:${params.port} end`;
          this.logDatas.push({
            time,
            log,
          });

          break;

        default:
          break;
      }
    });
  },
};
</script>

<style scoped>
</style>
