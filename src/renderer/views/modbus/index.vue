<template>

  <div>

    <!--modbus连接tabs-->
    <el-tabs
      type="card"
      @tab-click="handleModbusConnectionClick"
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
        v-for="(connection, connectionId) in modbusConnectionTabList"
        :key="connectionId"
        :label="connectionId"
        :name="connectionId"
      >

        <!--搜索modbus地址form-->
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
              :loading="isModbusAddrSearch"
              @click="handleModbusAddrSearch(connection.ip, connection.port)"
            >开始查询</el-button>
          </el-form-item>
        </el-form>

        <!--modbus地址tabs-->
        <el-tabs
          type="card"
          @tab-click="handleModbusAddrClick"
        >
          <el-tab-pane
            v-for="(item, addr) in modbusAddrTabList[connectionId]"
            :key="addr"
            :label="'地址'+addr"
            :name="addr"
          >
            <el-button
              type="primary"
              @click="handleReadHoldingRegisters(connection.ip, connection.port, addr)"
            >读保存寄存器</el-button>

            <el-form
              :inline="true"
              :model="modbusWriteHoldingRegistersModel"
              class="demo-form-inline"
            >
              <el-form-item label="寄存器地址">
                <el-input
                  v-model="modbusWriteHoldingRegistersModel.regAddr"
                  placeholder="寄存器地址"
                ></el-input>
              </el-form-item>
              <el-form-item label="寄存器值">
                <el-input
                  v-model="modbusWriteHoldingRegistersModel.regValue"
                  placeholder="寄存器值"
                ></el-input>
              </el-form-item>
              <el-form-item label="数量">
                <el-input
                  v-model="modbusWriteHoldingRegistersModel.regQuantity"
                  placeholder="数量"
                ></el-input>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  :loading="isModbusWriteHoldingRegisters"
                  @click="handleWriteHoldingRegisters(connection.ip, connection.port, addr)"
                >写保存寄存器</el-button>
              </el-form-item>
            </el-form>

            <el-table
              :data="regDatas[connectionId][addr]"
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

      // 是否正在搜索modbus地址中
      isModbusAddrSearch: false,
      //当前正在检查的modbus地址
      checkModbusSlaveAddr: null,

      isModbusWriteHoldingRegisters: false,

      // 当前modbus连接列表
      modbusConnectionTabList: {},
      // 当前modbus连接
      //modbusConnection: null,

      //当前modbus地址列表
      modbusAddrTabList: {},
      //当前modbus地址
      //modbusAddr: null,

      // 寄存器数据
      regDataList: {}, //避免table数据重复的唯一列表
      regDatas: {},

      modbusAddrModel: {
        startAddr: 1,
        endAddr: 10,
      },

      modbusWriteHoldingRegistersModel: {
        regAddr: '',
        regValue: '',
        regQuantity: '',
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
              this.regDataList[modbusConnectionId] = {};
            }
            if (!this.regDatas[modbusConnectionId]) {
              this.regDatas[modbusConnectionId] = {};
            }
          } else {
            if (!this.regDataList[modbusConnectionId]) {
              this.regDataList[modbusConnectionId] = {};
            }
            if (!this.regDatas[modbusConnectionId]) {
              this.regDatas[modbusConnectionId] = {};
            }
          }
        }
      },
    },
  },

  methods: {
    // modbus连接tab点击切换
    handleModbusConnectionClick(tab, event) {
      /*
      //console.log(tab, event);
      //console.log(tab.name, tab.label);
      if (tab.name === 'log') return;
      this.modbusConnection = this.modbusConnectionTabList[tab.name];
      */
    },

    // modbus地址，tab点击切换
    handleModbusAddrClick(tab, event) {
      //
      //this.modbusAddr = tab.name;
    },

    // 已有modbus连接下搜索存在的地址
    handleModbusAddrSearch(ip, port) {
      console.log('handleModbusAddrSearch', ip, port);

      // 在某个从机地址下，随意读取一个寄存器地址，如果读取超时，说明地址不存在
      this.isModbusAddrSearch = true;
      this.checkModbusSlaveAddr = this.modbusAddrModel.startAddr;
      this.checkSlaveAddr(ip, port, this.checkModbusSlaveAddr);
    },

    //检查slave设备地址是否存在
    checkSlaveAddr(ip, port, slaveAddr) {
      const params = this.getSlaveParams(ip, port, slaveAddr);
      ipcRenderer.invoke('modbus', 'checkSlaveAddr', params);
    },

    // 读保存寄存器
    handleReadHoldingRegisters(ip, port, slaveAddr) {
      const params = this.getSlaveParams(ip, port, slaveAddr);
      const modbusParams = {
        regAddr: 0x405,
        regQuantity: 36,
      };
      Object.assign(params, modbusParams);

      ipcRenderer.invoke('modbus', 'readHoldingRegisters', params);
    },

    // 写保存寄存器
    handleWriteHoldingRegisters(ip, port, slaveAddr) {
      if (
        !this.modbusWriteHoldingRegistersModel.regAddr ||
        !this.modbusWriteHoldingRegistersModel.regValue ||
        !this.modbusWriteHoldingRegistersModel.regQuantity
      ) {
        this.$alert('请输入寄存器内容', '输入异常', {
          confirmButtonText: '确定',
        });
        return;
      }

      const params = this.getSlaveParams(ip, port, slaveAddr);
      const modbusParams = {
        regAddr: Number.parseInt(
          this.modbusWriteHoldingRegistersModel.regAddr,
          16
        ),
        regValue: Number.parseInt(
          this.modbusWriteHoldingRegistersModel.regValue,
          16
        ),
        regQuantity: Number.parseInt(
          this.modbusWriteHoldingRegistersModel.regQuantity,
          16
        ),
      };
      Object.assign(params, modbusParams);

      console.log('handleWriteHoldingRegisters', params);

      ipcRenderer.invoke('modbus', 'writeHoldingRegisters', params);
    },

    // 获取slave通信参数，包括ip，port，addr
    getSlaveParams(ip, port, slaveAddr) {
      slaveAddr = Number(slaveAddr);
      const params = {
        slaveAddr,
      };
      // 【重要】当前页面只使用ip作为connectionId
      if (this.isModbusOnlyIp) {
        params.connectionId = `${ip}`;
      } else {
        params.connectionId = `${ip}:${port}`;
      }
      //params.ip = ip;
      //params.port = port;
      return params;
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

      let time, log, errorCode, connectionId;

      if (requestInfo) {
        errorCode = requestInfo.errorCode;
        // 获取完整的连接id，区别于requestInfo.connectionId（可能只有ip）
        connectionId = `${requestInfo.ip}:${requestInfo.port}`;
      }

      switch (msg) {
        case 'onCheckSlaveAddr':
          if (errorCode) {
            console.log('onCheckSlaveAddr errorCode', errorCode);

            switch (errorCode) {
              // modbus busy，重新发送
              case modbusException.ConnectionBusy:
                this.checkSlaveAddr(
                  requestInfo.ip,
                  requestInfo.port,
                  this.checkModbusSlaveAddr
                );
                break;

              // 读取超时，表示地址不存在，继续检查下一个地址
              case modbusException.RequestTimeout:
                this.checkModbusSlaveAddr++;
                if (this.checkModbusSlaveAddr <= this.modbusAddrModel.endAddr) {
                  this.checkSlaveAddr(
                    requestInfo.ip,
                    requestInfo.port,
                    this.checkModbusSlaveAddr
                  );
                } else {
                  //搜索完毕，停止搜索地址
                  this.isModbusAddrSearch = false;
                }
                break;

              default:
                //其他异常，停止搜索地址
                this.isModbusAddrSearch = false;
                break;
            }

            return;
          }

          // 当前地址ok
          console.log(
            '-----------slaveAddr ok---------',
            requestInfo.slaveAddr,
            this.modbusAddrTabList,
            this.regDataList,
            this.regDatas
          );
          // 保存地址信息

          if (!this.modbusAddrTabList[connectionId]) {
            this.modbusAddrTabList[connectionId] = {};
          }
          this.modbusAddrTabList[connectionId][requestInfo.slaveAddr] =
            requestInfo.slaveAddr;
          if (!this.regDataList[connectionId][requestInfo.slaveAddr]) {
            this.regDataList[connectionId][requestInfo.slaveAddr] = {};
          }
          if (!this.regDatas[connectionId][requestInfo.slaveAddr]) {
            this.regDatas[connectionId][requestInfo.slaveAddr] = [];
          }

          // 继续检查下一个地址
          this.checkModbusSlaveAddr++;
          if (this.checkModbusSlaveAddr <= this.modbusAddrModel.endAddr) {
            this.checkSlaveAddr(
              requestInfo.ip,
              requestInfo.port,
              this.checkModbusSlaveAddr
            );
          } else {
            //搜索完毕，停止搜索地址
            this.isModbusAddrSearch = false;
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
          const regDatas = this.regDatas[connectionId][requestInfo.slaveAddr];
          const regDataList = this.regDataList[connectionId][
            requestInfo.slaveAddr
          ];

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
