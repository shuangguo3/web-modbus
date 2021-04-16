<template>

  <div>

    <el-tabs
      v-model="activeName"
      @tab-click="handleClick"
    >
      <el-tab-pane
        label="连接日志"
        name="first"
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
        label="读保存寄存器"
        name="fourth"
      >

        <el-button
          type="primary"
          round
          @click="readHoldingRegisters"
        >开始读寄存器</el-button>

        <el-table
          :data="regDatas"
          style="width: 100%"
        >
          <el-table-column label="地址">
            <template slot-scope="scope">
              {{ scope.row.regAddr }}
            </template>
          </el-table-column>
          <el-table-column label="16进制值">
            <template slot-scope="scope">
              {{ scope.row.valueOf16 }}
            </template>
          </el-table-column>
          <el-table-column label="10进制值">
            <template slot-scope="scope">
              {{ scope.row.valueOf10 }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <!--
      <el-tab-pane
        label="读线圈"
        name="second"
      >读线圈</el-tab-pane>
      <el-tab-pane
        label="读输入离散量"
        name="third"
      >读输入离散量</el-tab-pane>

      <el-tab-pane
        label="读输入寄存器"
        name="five"
      >读输入寄存器</el-tab-pane>
      -->

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
      modbusConnectionId: null,
      regDatas: [],

      activeName: 'first',

      //网络通讯日志
      logDatas: [
        {
          time: '2016-05-02',
          log: '初始化',
        },
      ],
    };
  },

  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
    },

    /*
            this.modbusRtu.getHoldingRegistersValue((regInfo) => {
              //
              this.regDatas.push({
                regAddr: regInfo.regAddr,
                valueOf16: regInfo.regValue,
                valueOf10: regInfo.regValue,
              });
            });
            */

    readHoldingRegisters() {
      ipcRenderer.invoke('modbus', 'ReadHoldingRegisters', {
        connectionId: this.modbusConnectionId,
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
    // electron 通信协议详解
    ipcRenderer
      .invoke('modbus', 'createRtu', {
        //
        // 通信对端的ip和端口，标识唯一的通信信道
        ip: '192.168.1.254',
        port: 30002,
      })
      .then((result) => {
        this.modbusConnectionId = result;
        console.log('this.modbusConnectionId', this.modbusConnectionId);
      });

    ipcRenderer.on('modbus', (event, msg, params, requestInfo) => {
      //console.log(event, message, params); // Prints 'whoooooooh!'

      let requestInfo;
      switch (msg) {
        case 'onReadHoldingRegisters':
          //console.log('ipcRenderer modbus', msg, params);
          requestInfo = params;
          requestInfo.requestBuf = Buffer.from(requestInfo.requestBuf);
          requestInfo.responseBuf = Buffer.from(requestInfo.requestBuf);

          console.log('ipcRenderer modbus', requestInfo);
          break;

        /*
        case 'connect':
          console.log('connect'); // Prints 'whoooooooh!'
          const time = jsUtil.timestampToTime(new Date().getTime());
          const log = param;
          this.logDatas.push({
            time,
            log,
          });

          break;
          */

        default:
          break;
      }
    });
  },
};
</script>

<style scoped>
</style>
