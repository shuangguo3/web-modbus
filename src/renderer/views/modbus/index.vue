<template>

  <div>

    <el-tabs @tab-click="handleModbusConnectionClick">
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
        v-for="(connection, connectionId) in modbusConnectionTabList"
        :key="connectionId"
        :label="connectionId"
        :name="connectionId"
      >

        <el-form
          :inline="true"
          :model="modbusAddrModel"
          class="demo-form-inline"
        >
          <el-form-item label="modbus起始地址">
            <el-input
              v-model="modbusAddrModel.startAddr"
              placeholder="起始地址"
              :value="modbusAddrModel.startAddr"
            ></el-input>
          </el-form-item>
          <el-form-item label="modbus结束地址">
            <el-input
              v-model="modbusAddrModel.endAddr"
              placeholder="结束地址"
              :value="modbusAddrModel.endAddr"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="handleModbusAddrSearch"
            >开始查询</el-button>
          </el-form-item>
        </el-form>

        <el-button
          type="primary"
          round
          @click="handleReadHoldingRegisters"
        >开始读寄存器</el-button>

        <el-table
          :data="regDatas[connection.ip]"
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

const modbusException = require('../../../modbus/exception.js');

export default {
  name: 'AlarmPage',

  data() {
    return {
      //modbus只使用ip作为连接id
      isModbusOnlyIp: true,
      modbusConnection: null,

      checkModbusSlaveAddr: null,

      modbusConnectionTabList: null,
      regDataList: {},
      regDatas: {},

      modbusAddrModel: {
        startAddr: 1,
        endAddr: 10,
      },

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
          const modbusConnection = modbusConnectionList[modbusConnectionId];

          // 【重要】当前页面只使用ip作为connectionId
          if (this.isModbusOnlyIp) {
            if (!this.regDataList[modbusConnectionId]) {
              this.regDataList[modbusConnection.ip] = {};
            }
            if (!this.regDatas[modbusConnectionId]) {
              this.regDatas[modbusConnection.ip] = [];
            }
          } else {
            if (!this.regDataList[modbusConnectionId]) {
              this.regDataList[modbusConnectionId] = {};
            }
            if (!this.regDatas[modbusConnectionId]) {
              this.regDatas[modbusConnectionId] = [];
            }
          }
        }
      },
    },
  },

  methods: {
    testToken() {
      this.$store.commit('SET_TOKEN', 'test111');
    },

    // modbus连接tab点击切换
    handleModbusConnectionClick(tab, event) {
      //console.log(tab, event);
      //console.log(tab.name, tab.label);
      if (tab.name === 'log') return;
      this.modbusConnection = this.modbusConnectionTabList[tab.name];
    },

    // 已有modbus连接下搜索存在的地址
    handleModbusAddrSearch() {
      // 在某个从机地址下，随意读取一个寄存器地址，如果读取超时，说明地址不存在
      this.checkModbusSlaveAddr = this.modbusAddrModel.startAddr;
      this.checkSlaveAddr(this.checkModbusSlaveAddr);
    },

    handleReadHoldingRegisters() {
      this.readHoldingRegisters({
        slaveAddr: 0x01,
        regAddr: 0x405,
        regQuantity: 6,
      });
    },

    //检查slave设备地址是否存在
    checkSlaveAddr(slaveAddr) {
      const params = {
        slaveAddr,
      };
      // 【重要】当前页面只使用ip作为connectionId
      if (this.isModbusOnlyIp) {
        params.connectionId = `${this.modbusConnection.ip}`;
        params.ip = this.modbusConnection.ip;
      } else {
        params.connectionId = `${this.modbusConnection.ip}:${this.modbusConnection.port}`;
        params.ip = this.modbusConnection.ip;
        params.port = this.modbusConnection.port;
      }

      ipcRenderer.invoke('modbus', 'checkSlaveAddr', params);
    },

    // 读保存寄存器
    readHoldingRegisters(modbusParams) {
      /*
      const params = {
        slaveAddr: 0x01,
        regAddr: 0x405,
        regQuantity: 6,
      };
      */
      const params = modbusParams;
      // 【重要】当前页面只使用ip作为connectionId
      if (this.isModbusOnlyIp) {
        params.connectionId = `${this.modbusConnection.ip}`;
        params.ip = this.modbusConnection.ip;
      } else {
        params.connectionId = `${this.modbusConnection.ip}:${this.modbusConnection.port}`;
        params.ip = this.modbusConnection.ip;
        params.port = this.modbusConnection.port;
      }

      ipcRenderer.invoke('modbus', 'readHoldingRegisters', params);
    },
  },

  created: function () {
    // 主动去获取一次modbus连接列表，避免渲染进程未启动时，遗漏主进程已经收到的连接
    ipcRenderer.invoke('modbus', 'getConnectionList').then((connectionList) => {
      console.log('getConnectionList', connectionList);
      //this.modbusConnectionTabList = modbusConnectionList;
      this.$store.dispatch('newConnection', { connectionList });
    });

    // 响应主进程
    ipcRenderer.on('modbus', (event, msg, params, requestInfo) => {
      console.log('modbus', msg, params, requestInfo);

      let time, log, errorCode;

      if (requestInfo) {
        errorCode = requestInfo.errorCode;
      }

      switch (msg) {
        case 'onCheckSlaveAddr':
          if (errorCode) {
            console.log('onCheckSlaveAddr errorCode', errorCode);

            switch (errorCode) {
              // modbus busy，重新发送
              case modbusException.ConnectionBusy:
                this.checkSlaveAddr(this.checkModbusSlaveAddr);
                break;

              // 读取超时，表示地址不存在，继续检查下一个地址
              case modbusException.RequestTimeout:
                this.checkModbusSlaveAddr++;
                if (this.checkModbusSlaveAddr <= this.modbusAddrModel.endAddr) {
                  this.checkSlaveAddr(this.checkModbusSlaveAddr);
                }
                break;

              default:
                break;
            }

            return;
          }

          // 当前地址ok
          console.log(
            '-----------slaveAddr ok---------',
            requestInfo.slaveAddr
          );

          // 继续检查下一个地址
          this.checkModbusSlaveAddr++;
          if (this.checkModbusSlaveAddr <= this.modbusAddrModel.endAddr) {
            this.checkSlaveAddr(this.checkModbusSlaveAddr);
          }

          break;
        // 获取到保存寄存器值
        case 'onReadHoldingRegisters':
          console.log('this.regDatas', this.regDatas);
          console.log('requestInfo', requestInfo);

          if (errorCode) {
            console.log('onReadHoldingRegisters errorCode', errorCode);
            return;
          }

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
