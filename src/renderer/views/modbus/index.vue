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
const { ipcRenderer, remote } = require('electron');

import jsUtil from '@/utils/jsUtil.js';

const ModbusRtu = require('../../../modbus/rtu.js');

export default {
  name: 'AlarmPage',

  data() {
    return {
      modbusRtu: null,
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

    readHoldingRegisters() {
      this.$ipcApi.send('modbus', {
        fc: 'ReadHoldingRegisters',
        params: {
          slaveAddr: 0x01,
          regAddr: 0x8008,
          regQuantity: 6,
          callback: (slaveInfo) => {
            console.log('callback', slaveInfo);

            this.modbusRtu.getHoldingRegistersValue((regInfo) => {
              //
              this.regDatas.push({
                regAddr: regInfo.regAddr,
                valueOf16: regInfo.regValue,
                valueOf10: regInfo.regValue,
              });
            });
          },
          errorCallback(errorCode, slaveInfo) {
            console.log('errorCallback', errorCode, slaveInfo);
          },
        },
      });

      this.modbusRtu.ReadHoldingRegisters();
    },
  },

  created: function () {
    console.log('ipcRenderer', ipcRenderer);

    console.log('remote', remote);
    const modbusTcp = remote.getGlobal('modbusTcp');

    console.log('global.modbusRtu', modbusTcp);

    this.modbusRtu = new ModbusRtu({
      tcp: modbusTcp,
      // 通信对端的ip和端口，标识唯一的通信信道
      ip: '192.168.1.254',
      port: 30002,
    });

    ipcRenderer.on('modbus', (event, message, param) => {
      //console.log(event, message, params); // Prints 'whoooooooh!'
      switch (message) {
        case 'connect':
          console.log('connect'); // Prints 'whoooooooh!'
          const time = jsUtil.timestampToTime(new Date().getTime());
          const log = param;
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
