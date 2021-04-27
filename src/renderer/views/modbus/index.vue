<template>

  <div>

    <!--modbus连接tabs-->
    <el-tabs
      type="card"
      @tab-click="handleModbusConnectionClick"
      value="log"
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
        <div class="padding">

          <el-form
            :inline="true"
            :model="modbusAddrModel"
            size="small"
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
                @click="handleModbusAddrSearch(connection.host, connection.port)"
              >开始查询</el-button>
            </el-form-item>
          </el-form>

          <!--modbus地址tabs-->
          <el-tabs
            type="card"
            :value="modbusAddrTabActList[connectionId]"
            @tab-click="handleModbusAddrClick"
          >
            <el-tab-pane
              v-for="(item, addr) in modbusAddrTabList[connectionId]"
              :key="addr"
              :label="'地址'+addr"
              :name="addr"
            >

              <!--读写tabs-->
              <div class="padding">

                <el-tabs
                  type="card"
                  value="read"
                >
                  <el-tab-pane
                    label="读操作"
                    name="read"
                  >

                    <div class="padding">

                      <el-form
                        :inline="true"
                        size="small"
                        :model="modbusReadHoldingRegistersModel"
                      >
                        <el-form-item label="寄存器地址">
                          <el-input
                            v-model="modbusReadHoldingRegistersModel.regAddr"
                            placeholder="寄存器地址（16进制）"
                          ></el-input>
                        </el-form-item>
                        <el-form-item label="数量">
                          <el-input
                            v-model="modbusReadHoldingRegistersModel.regQuantity"
                            placeholder="数量（10进制）"
                          ></el-input>
                        </el-form-item>
                        <el-form-item>
                          <el-button
                            type="primary"
                            :loading="isModbusReadHoldingRegisters"
                            @click="handleReadHoldingRegisters(connection.host, connection.port, addr)"
                          >读保存寄存器</el-button>
                        </el-form-item>
                      </el-form>

                    </div>

                  </el-tab-pane>

                  <el-tab-pane
                    label="写操作"
                    name="write"
                  >

                    <div class="padding">

                      <el-form
                        :inline="true"
                        size="small"
                        :model="modbusWriteHoldingRegistersModel"
                      >
                        <el-form-item label="寄存器地址">
                          <el-input
                            v-model="modbusWriteHoldingRegistersModel.regAddr"
                            placeholder="寄存器地址（16进制）"
                          ></el-input>
                        </el-form-item>
                        <el-form-item label="寄存器值">
                          <el-input
                            v-model="modbusWriteHoldingRegistersModel.regValue"
                            placeholder="寄存器值（16进制）"
                          ></el-input>
                        </el-form-item>
                        <el-form-item label="数量">
                          <el-input
                            v-model="modbusWriteHoldingRegistersModel.regQuantity"
                            placeholder="数量（10进制）"
                          ></el-input>
                        </el-form-item>
                        <el-form-item>
                          <el-button
                            type="primary"
                            :loading="isModbusWriteHoldingRegisters"
                            @click="handleWriteHoldingRegisters(connection.host, connection.port, addr)"
                          >写保存寄存器</el-button>
                        </el-form-item>
                      </el-form>
                    </div>

                  </el-tab-pane>
                </el-tabs>

                <div class="padding">
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
                </div>

              </div>

            </el-tab-pane>
          </el-tabs>

        </div>

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

      isModbusReadHoldingRegisters: false,
      isModbusWriteHoldingRegisters: false,

      // 当前modbus连接列表
      modbusConnectionTabList: {},
      // 当前modbus连接
      //modbusConnection: null,

      //当前modbus地址列表
      modbusAddrTabList: {},
      //当前modbus地址
      //modbusAddr: null,
      // 激活的tab（第一个搜索到的tab）
      modbusAddrTabActList: {},

      // 寄存器数据
      regDataList: {}, //避免table数据重复的唯一列表
      regDatas: {},

      modbusAddrModel: {
        startAddr: 1,
        endAddr: 2,
      },

      modbusWriteHoldingRegistersModel: {
        regAddr: '',
        regValue: '',
        regQuantity: '',
      },

      modbusReadHoldingRegistersModel: {
        regAddr: '',
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
    handleModbusAddrSearch(host, port) {
      console.log('handleModbusAddrSearch', host, port);

      // 在某个从机地址下，随意读取一个寄存器地址，如果读取超时，说明地址不存在
      this.isModbusAddrSearch = true;
      this.checkModbusSlaveAddr = this.modbusAddrModel.startAddr;
      this.checkSlaveAddr(host, port, this.checkModbusSlaveAddr);
    },

    //检查slave设备地址是否存在
    checkSlaveAddr(host, port, slaveAddr) {
      const params = this.getSlaveParams(host, port, slaveAddr);
      ipcRenderer.invoke('modbus', 'checkSlaveAddr', params);
    },

    // 读保存寄存器
    handleReadHoldingRegisters(host, port, slaveAddr) {
      if (
        !this.modbusReadHoldingRegistersModel.regAddr ||
        !this.modbusReadHoldingRegistersModel.regQuantity
      ) {
        this.$alert('请输入寄存器内容', '输入异常', {
          confirmButtonText: '确定',
        });
        return;
      }

      this.isModbusReadHoldingRegisters = true;
      const params = this.getSlaveParams(host, port, slaveAddr);
      const modbusParams = {
        regAddr: Number.parseInt(
          this.modbusReadHoldingRegistersModel.regAddr,
          16
        ),
        regQuantity: Number.parseInt(
          this.modbusReadHoldingRegistersModel.regQuantity,
          10
        ),
      };
      Object.assign(params, modbusParams);

      ipcRenderer.invoke('modbus', 'readHoldingRegisters', params);
    },

    // 写保存寄存器
    handleWriteHoldingRegisters(host, port, slaveAddr) {
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

      this.isModbusWriteHoldingRegisters = true;

      const params = this.getSlaveParams(host, port, slaveAddr);
      const modbusParams = {
        regAddr: Number.parseInt(
          this.modbusWriteHoldingRegistersModel.regAddr,
          16
        ),
        // 只需要传入第一个寄存器值，后续的寄存器值依次递增来设置
        regValue: Number.parseInt(
          this.modbusWriteHoldingRegistersModel.regValue,
          16
        ),
        regQuantity: Number.parseInt(
          this.modbusWriteHoldingRegistersModel.regQuantity,
          10
        ),
        options: {
          // 是否跳过16进制的a~f
          isSkip16: true,
          // 某些厂家程序bug，可能导致modbus协议不标准，这里可设置响应长度
          responseDataLength: 10,
        },
      };
      Object.assign(params, modbusParams);

      console.log('handleWriteHoldingRegisters', params);

      ipcRenderer.invoke('modbus', 'writeHoldingRegisters', params);
    },

    // 获取slave通信参数，包括ip，port，addr
    getSlaveParams(host, port, slaveAddr) {
      slaveAddr = Number(slaveAddr);
      const params = {
        slaveAddr,
      };
      // 【重要】当前页面只使用ip作为connectionId
      if (this.isModbusOnlyIp) {
        params.connectionId = `${host}`;
      } else {
        params.connectionId = `${host}:${port}`;
      }
      //params.host = host;
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

      let time, log, errorCode, connectionId, regDataList;

      if (requestInfo) {
        errorCode = requestInfo.errorCode;
        // 获取完整的连接id，区别于requestInfo.connectionId（可能只有ip）
        connectionId = `${requestInfo.host}:${requestInfo.port}`;
      }

      switch (msg) {
        case 'onCheckSlaveAddr':
          if (errorCode) {
            console.log('onCheckSlaveAddr errorCode', errorCode);

            switch (errorCode) {
              // modbus busy，重新发送
              case modbusException.ConnectionBusy:
                this.checkSlaveAddr(
                  requestInfo.host,
                  requestInfo.port,
                  this.checkModbusSlaveAddr
                );
                break;

              // 读取超时，表示地址不存在，继续检查下一个地址
              case modbusException.RequestTimeout:
                this.checkModbusSlaveAddr++;
                if (this.checkModbusSlaveAddr <= this.modbusAddrModel.endAddr) {
                  this.$nextTick(() => {
                    this.checkSlaveAddr(
                      requestInfo.host,
                      requestInfo.port,
                      this.checkModbusSlaveAddr
                    );
                  });
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

          // 设置第一个addr，为激活的tab
          if (!this.modbusAddrTabActList[connectionId]) {
            this.modbusAddrTabActList[
              connectionId
            ] = requestInfo.slaveAddr.toString();
          }

          // 继续检查下一个地址
          this.checkModbusSlaveAddr++;
          if (this.checkModbusSlaveAddr <= this.modbusAddrModel.endAddr) {
            this.$nextTick(() => {
              this.checkSlaveAddr(
                requestInfo.host,
                requestInfo.port,
                this.checkModbusSlaveAddr
              );
            });
          } else {
            //搜索完毕，停止搜索地址
            this.isModbusAddrSearch = false;
          }

          break;
        // 获取到保存寄存器值
        case 'onReadHoldingRegisters':
          console.log('this.regDatas', this.regDatas);
          console.log('requestInfo', requestInfo);

          this.isModbusReadHoldingRegisters = false;

          if (errorCode) {
            console.log('onReadHoldingRegisters errorCode', errorCode);
            return;
          }

          //regDataList = this.regDataList;

          regDataList = this.regDataList[connectionId][requestInfo.slaveAddr];

          for (let regAddr in params) {
            const regValue = params[regAddr];
            regDataList[regAddr] = regValue;
          }
          //hex.toString(16)

          this.regDatas[connectionId][requestInfo.slaveAddr] = [];
          for (let regAddr in regDataList) {
            regAddr = Number(regAddr);
            const regValue = regDataList[regAddr];

            this.regDatas[connectionId][requestInfo.slaveAddr].push({
              regAddr: regAddr.toString(16),
              valueOf16: regValue.toString(16),
              valueOf10: regValue.toString(),
            });
          }

          this.regDatas[connectionId][requestInfo.slaveAddr] = this.regDatas[
            connectionId
          ][requestInfo.slaveAddr].sort((a, b) => {
            return a.regAddr - b.regAddr;
          });

          console.log('this.regDatas', this.regDatas);

          this.regDatas = this.regDatas;
          this.regDataList = this.regDataList;
          break;

        // 写保存寄存器完成
        case 'onWriteHoldingRegisters':
          this.isModbusWriteHoldingRegisters = false;
          if (errorCode) {
            console.log('onWriteHoldingRegisters errorCode', errorCode);
            this.$alert('写入失败', '提示', {
              confirmButtonText: '确定',
            });
            return;
          }

          this.$alert('写入成功', '提示', {
            confirmButtonText: '确定',
          });

          const requestBuf = Buffer.from(requestInfo.requestBuf);
          let regAddr = requestInfo.regAddr;

          regDataList = this.regDataList[connectionId][requestInfo.slaveAddr];

          for (let i = 0; i < requestInfo.regQuantity; i++) {
            const regValue = requestBuf.readUIntBE(7 + i * 2, 2);
            regDataList[regAddr] = regValue;
            regAddr++;
          }

          this.regDatas[connectionId][requestInfo.slaveAddr] = [];
          for (let regAddr in regDataList) {
            regAddr = Number(regAddr);
            const regValue = regDataList[regAddr];

            this.regDatas[connectionId][requestInfo.slaveAddr].push({
              regAddr: regAddr.toString(16),
              valueOf16: regValue.toString(16),
              valueOf10: regValue.toString(),
            });
          }

          this.regDatas[connectionId][requestInfo.slaveAddr] = this.regDatas[
            connectionId
          ][requestInfo.slaveAddr].sort((a, b) => {
            return a.regAddr - b.regAddr;
          });

          console.log('this.regDatas', this.regDatas);

          this.regDatas = this.regDatas;
          this.regDataList = this.regDataList;
          break;

        // 客户端已连接
        case 'onConnection':
          console.log('connect'); // Prints 'whoooooooh!'
          time = jsUtil.timestampToTime(new Date().getTime());
          log = `${params.host}:${params.port} connected`;
          this.logDatas.push({
            time,
            log,
          });
          break;

        // 客户端关闭
        case 'onEnd':
          console.log('end'); // Prints 'whoooooooh!'
          time = jsUtil.timestampToTime(new Date().getTime());
          log = `${params.host}:${params.port} end`;
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
.padding {
  padding: 0 15px;
}
</style>
