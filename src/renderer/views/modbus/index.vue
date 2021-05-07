<template>

  <el-container class="container">

    <el-main>
      <!--modbus连接tabs-->
      <el-tabs
        type="card"
        @tab-click="handleModbusConnectionClick"
        value="connect"
      >
        <el-tab-pane
          label="连接设置"
          name="connect"
        >

          <div class="padding">
            <ul>
              <li><b>使用说明</b></li>
              <li>使用Modbus RTU Over Tcp/Ip方式进行通讯</li>
              <li>以modbus主站的身份通讯，通过rtu协议向modbus网关连接的从站设备下发指令</li>
              <li>组网方式：当前程序主机通过网口连接到modbu网关（串口服务器），modbu网关通过485连接多个从站设备</li>
              <li>使用tcp信道作为modbus通讯信道，可同时以server和client模式建立tcp连接</li>
              <li>以server或client模式建立tcp连接后，即可在此连接上进行不间断的modbus通讯</li>
            </ul>

            <el-tabs
              type="card"
              value="server"
            >
              <el-tab-pane
                label="server模式"
                name="server"
              >

                <el-button
                  type="primary"
                  :loading="isHandleExportFile"
                  @click="handleExportFile"
                >导出文件</el-button>

                <div style="padding: 15px; margin-top:20px; border:1px solid #eee;">
                  <span
                    style="color:#67C23A"
                    v-if="modbusServerPort!=null"
                  >server已启动，正在监听{{modbusServerPort}}端口</span>
                  <span
                    style="color:#909399"
                    v-else
                  >server未启动</span>
                  <el-button
                    style="margin-left:20px;"
                    type="primary"
                    size="small"
                    :loading="isHandleModbusServer"
                    @click="handleModbusServer"
                  >{{modbusServerPort!=null?'关闭server':'启动server'}}</el-button>
                </div>

                <div style="padding: 15px 15px 0; margin-top:20px; border:1px solid #eee;">
                  <el-form
                    :inline="true"
                    :model="modbusServerModel"
                    size="small"
                  >
                    <el-form-item label="server端口">
                      <el-input
                        style="width:100px"
                        v-model="modbusServerModel.serverPort"
                        placeholder="server端口"
                        :value="modbusServerModel.serverPort"
                      ></el-input>
                    </el-form-item>
                    <el-form-item>
                      <el-button
                        type="primary"
                        @click="handleModbusServerPort"
                      >修改server端口</el-button>
                    </el-form-item>
                  </el-form>
                </div>

              </el-tab-pane>

              <el-tab-pane
                label="client模式"
                name="client"
              >

                <el-form
                  :inline="true"
                  :model="modbusClientModel"
                  size="small"
                >
                  <el-form-item label="server地址">
                    <el-input
                      style="width:200px"
                      v-model="modbusClientModel.host"
                      placeholder="server地址"
                      :value="modbusClientModel.host"
                    ></el-input>
                  </el-form-item>
                  <el-form-item label="server端口">
                    <el-input
                      style="width:100px"
                      v-model="modbusClientModel.port"
                      placeholder="server端口"
                      :value="modbusClientModel.port"
                    ></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-button
                      type="primary"
                      :loading="isHandleModbusConnect"
                      @click="handleModbusConnect"
                    >连接</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>

          </div>

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
              <el-form-item label="从机起始地址">
                <el-input
                  style="width:100px"
                  v-model="modbusAddrModel.startAddr"
                  placeholder="起始地址"
                  :value="modbusAddrModel.startAddr"
                ></el-input>
              </el-form-item>
              <el-form-item label="从机结束地址">
                <el-input
                  style="width:100px"
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
                >查询地址</el-button>
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
                    value="holdingRegisters"
                  >

                    <el-tab-pane
                      label="保存寄存器"
                      name="holdingRegisters"
                    >

                      <el-form
                        :inline="true"
                        size="small"
                        :model="modbusHoldingRegistersModel"
                      >
                        <el-form-item label="地址（16进制）">
                          <el-input
                            style="width:80px"
                            v-model="modbusHoldingRegistersModel.regAddr"
                            placeholder="地址"
                          ></el-input>
                        </el-form-item>

                        <el-form-item label="数量（10进制）">
                          <el-input
                            style="width:80px"
                            v-model="modbusHoldingRegistersModel.regQuantity"
                            placeholder="数量"
                          ></el-input>
                        </el-form-item>

                        <el-form-item
                          v-if="(modbusFC === '0xf0' || modbusFC === '0x10')"
                          label="写入值（16进制）"
                        >
                          <el-input
                            style="width:80px"
                            v-model="modbusHoldingRegistersModel.regValue"
                            placeholder="值"
                          ></el-input>
                        </el-form-item>

                        <el-form-item>
                          <el-select
                            style="width:150px"
                            v-model="modbusFC"
                            placeholder="请选择"
                          >
                            <el-option
                              label="03 读多个寄存器"
                              value="0x03"
                            />
                            <el-option
                              label="10 写多个寄存器"
                              value="0x10"
                            />
                          </el-select>
                          <el-button
                            type="primary"
                            :loading="isHandleModbusHoldingRegisters"
                            @click="handleHoldingRegisters(connection.host, connection.port, addr)"
                          >下发命令</el-button>
                        </el-form-item>

                        <br />
                        <el-form-item>
                          <el-checkbox
                            v-show="modbusFC == '0x10'"
                            label="高级选项"
                            v-model="modbusHoldingRegistersModel.isShowAdvance"
                          ></el-checkbox>
                        </el-form-item>
                        <el-form-item v-show="modbusFC == '0x10' && modbusHoldingRegistersModel.isShowAdvance">
                          <el-tooltip
                            effect="dark"
                            content="当写入多个值时，随着地址递增，寄存器值也以写入值为基准递增，如果寄存器值需要跳过 A~F 的16进制值，就勾选此项"
                            placement="bottom-start"
                          >
                            <el-checkbox
                              label="寄存器值跳过16进制"
                              v-model="modbusHoldingRegistersModel.options.isSkip16"
                            ></el-checkbox>
                          </el-tooltip>
                          <el-tooltip
                            effect="dark"
                            content="某些小厂家的modbus实现有bug，所以modbus响应只简单检查slave地址，功能码等，如果要严格按照modbus协议检查响应，就勾选此项"
                            placement="bottom-start"
                          >
                            <el-checkbox
                              label="严格检查modbus响应"
                              v-model="modbusHoldingRegistersModel.options.isCheckResponse"
                            ></el-checkbox>
                          </el-tooltip>

                        </el-form-item>
                      </el-form>

                    </el-tab-pane>

                  </el-tabs>

                  <div class="padding">
                    <el-table
                      border
                      :data="regDatas[connectionId][addr]"
                      style="width: 100%"
                    >
                      <el-table-column label="寄存器地址">
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
    </el-main>

    <el-aside
      width="400px"
      class="log-sidebar"
    >
      <el-scrollbar class="scrollbar-wrapper">
        <el-table
          :data="logDatas"
          style="width: 100%"
        >
          <el-table-column label="日志">
            <template slot-scope="scope">
              <div v-if="scope.row.time">{{ scope.row.time }}</div>
              <div v-if="scope.row.log">{{ scope.row.log }}</div>
              <div v-if="scope.row.requestStr">{{ scope.row.requestStr }}</div>
              <div v-if="scope.row.responseStr">{{ scope.row.responseStr }}</div>
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>
    </el-aside>
  </el-container>

</template>

<script>
import fs from 'fs';

import { ipcRenderer } from 'electron';

import jsUtil from '@/utils/jsUtil.js';

import Store from 'electron-store';

const modbusException = require('../../../modbus/exception.js');

export default {
  name: 'AlarmPage',

  data() {
    return {
      //modbus只使用ip作为连接id
      isModbusOnlyIp: true,

      electronStore: null,

      //modbus server 监听端口
      modbusServerPort: null,

      modbusFC: '0x03',

      // 是否正在搜索modbus地址中
      isModbusAddrSearch: false,
      //当前正在检查的modbus地址
      checkModbusSlaveAddr: null,

      isHandleModbusServer: false, //正在启动或者关闭server
      isHandleModbusConnect: false, //以client模式，正在连接server
      isHandleModbusCoils: false, //正在读写线圈
      isHandleModbusHoldingRegisters: false, //正在读写保存寄存器

      isHandleExportFile: false,
      exportFileFd: null,

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

      //server模式设置
      modbusServerModel: {
        serverPort: '',
      },
      modbusConnectTimeout: null,

      //client模式设置
      modbusClientModel: {
        host: '',
        port: '',
      },

      // 地址搜索
      modbusAddrModel: {
        startAddr: 1,
        endAddr: 2,
      },

      //寄存器读写
      modbusHoldingRegistersModel: {
        regAddr: '',
        regValue: '',
        regQuantity: '',
        isShowAdvance: false, //是否显示高级选项
        options: {
          isSkip16: true,
          isCheckResponse: false,
        },
      },

      //网络通讯日志
      logDatas: [
        {
          log: '日志初始化',
        },
      ],
    };
  },

  watch: {
    '$store.state.modbus.serverPort': {
      immediate: true,
      handler(modbusServerPort) {
        this.modbusServerPort = modbusServerPort;
      },
    },
    '$store.state.modbus.connectionList': {
      immediate: true,
      handler(modbusConnectionList) {
        console.log('watch modbusConnectionList', modbusConnectionList);
        this.modbusConnectionTabList = modbusConnectionList;

        for (const modbusConnectionId in modbusConnectionList) {
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
    handleExportFile() {
      console.log(process.execPath);
      console.log(process.cwd());
      //return;

      const path = 'export/holdingRegister';
      jsUtil.mkdirsSync(path);
      this.exportFildFd = fs.openSync(`${path}/aa.txt`, 'a');
      if (!this.exportFildFd) {
        return;
      }

      fs.writeSync(this.exportFildFd, 'adfadsf\r\n');
      fs.writeSync(this.exportFildFd, 'bbbbbbb\r\n');
      fs.writeSync(this.exportFildFd, 'ccccccccc\r\n');

      fs.closeSync(this.exportFildFd);
      this.exportFildFd = null;
    },

    //启动或关闭server
    handleModbusServer() {
      this.isHandleModbusServer = true;
      if (this.modbusServerPort == null) {
        ipcRenderer.invoke('modbus', 'startServer');
      } else {
        ipcRenderer.invoke('modbus', 'closeServer');
      }
    },

    //修改server端口
    handleModbusServerPort() {
      this.electronStore.set(
        'modbus.serverPort',
        this.modbusServerModel.serverPort
      );

      this.$alert('如果要使用新端口，请关闭再启动server', '修改端口成功', {
        confirmButtonText: '确定',
      });
    },

    // 以client模式，连接server
    handleModbusConnect() {
      if (!this.modbusClientModel.host) {
        this.$alert('请输入主机地址', '输入异常', {
          confirmButtonText: '确定',
        });
        return;
      }
      if (!this.modbusClientModel.port) {
        this.$alert('请输入主机端口', '输入异常', {
          confirmButtonText: '确定',
        });
        return;
      }

      const modbusConnectionList = this.$store.state.modbus.connectionList;
      for (const modbusConnectionId in modbusConnectionList) {
        if (
          modbusConnectionId ==
          `${this.modbusClientModel.host}:${this.modbusClientModel.port}`
        ) {
          this.$alert('重复连接：' + modbusConnectionId, '输入异常', {
            confirmButtonText: '确定',
          });
          return;
        }
      }

      this.isHandleModbusConnect = true;
      ipcRenderer.invoke('modbus', 'connect', this.modbusClientModel);
      this.modbusConnectTimeout = setTimeout(() => {
        this.$alert('请检查主机状态', '连接失败', {
          confirmButtonText: '确定',
        });
        this.isHandleModbusConnect = false;
      }, 2000);
    },

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

    // 读写保存寄存器
    handleHoldingRegisters(host, port, slaveAddr) {
      console.log(
        'modbusHoldingRegistersModel',
        this.modbusHoldingRegistersModel
      );

      if (!this.modbusHoldingRegistersModel.regAddr) {
        this.$alert('请输入寄存器地址', '输入异常', {
          confirmButtonText: '确定',
        });
        return;
      }
      if (!this.modbusHoldingRegistersModel.regQuantity) {
        this.$alert('请输入寄存器数量', '输入异常', {
          confirmButtonText: '确定',
        });
        return;
      }

      if (
        this.modbusFC == '0x10' &&
        !this.modbusHoldingRegistersModel.regValue
      ) {
        this.$alert('请输入寄存器值', '输入异常', {
          confirmButtonText: '确定',
        });
        return;
      }

      this.isHandleModbusHoldingRegisters = true;

      const params = this.getSlaveParams(host, port, slaveAddr);
      const modbusParams = {
        regAddr: Number.parseInt(this.modbusHoldingRegistersModel.regAddr, 16),
        regQuantity: Number.parseInt(
          this.modbusHoldingRegistersModel.regQuantity,
          10
        ),
        // 只需要传入第一个寄存器值，后续的寄存器值依次递增来设置
        regValue: Number.parseInt(
          this.modbusHoldingRegistersModel.regValue,
          16
        ),
        options: this.modbusHoldingRegistersModel.options,
      };

      Object.assign(params, modbusParams);

      console.log('handleHoldingRegisters', params);

      switch (this.modbusFC) {
        case '0x03':
          ipcRenderer.invoke('modbus', 'readHoldingRegisters', params);
          break;

        case '0x10':
          ipcRenderer.invoke('modbus', 'writeHoldingRegisters', params);
          break;

        default:
          break;
      }
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

    modbusLog(requestInfo) {
      const requestBuf = Buffer.from(requestInfo.requestBuf);
      const responseBuf = Buffer.from(requestInfo.responseBuf);

      console.log('modbusLog', requestBuf, responseBuf);

      const getHexString = function (number) {
        if (number <= 9) {
          return '0' + number.toString(16);
        } else {
          return number.toString(16);
        }
      };

      let requestStr = '发送：',
        responseStr = '接收：';
      for (let i = 0; i < requestInfo.requestBuf.length; i++) {
        requestStr += getHexString(requestInfo.requestBuf[i]) + ' ';
      }
      for (let i = 0; i < requestInfo.responseBuf.length; i++) {
        responseStr += getHexString(requestInfo.responseBuf[i]) + ' ';
      }

      const time = jsUtil.timestampToTime(new Date().getTime(), {
        isNotShowDate: true,
      });
      this.logDatas.unshift({
        time: `【${time}】`,
        requestStr,
        responseStr,
      });

      console.log('modbusLog end');
    },
  },

  created: function () {
    //初始化store实例
    this.electronStore = new Store();
    this.modbusServerModel.serverPort = this.electronStore.get(
      'modbus.serverPort'
    );

    // 主动去获取一次modbus server 状态，避免渲染进程未启动时，遗漏主进程已经收到的连接
    ipcRenderer.invoke('modbus', 'getServerStatus').then((serverPort) => {
      this.$store.dispatch('modbusServer', { serverPort });
    });

    // 主动去获取一次modbus连接列表，避免渲染进程未启动时，遗漏主进程已经收到的连接
    ipcRenderer.invoke('modbus', 'getConnectionList').then((connectionList) => {
      console.log('getConnectionList', connectionList);
      //this.modbusConnectionTabList = modbusConnectionList;
      this.$store.dispatch('modbusConnection', { connectionList });
    });

    // 响应主进程
    ipcRenderer.on('modbus', (event, msg, params, requestInfo) => {
      console.log('modbus', msg, params, requestInfo);

      let time, errorCode, connectionId, regDataList, requestBuf, responseBuf;

      if (requestInfo) {
        errorCode = requestInfo.errorCode;
        // 获取完整的连接id，区别于requestInfo.connectionId（可能只有ip）
        connectionId = `${requestInfo.host}:${requestInfo.port}`;
      }

      switch (msg) {
        // server 启动成功
        case 'onStartServer':
        // server已关闭
        case 'onCloseServer':
          this.isHandleModbusServer = false;
          break;

        //以client模式，连接成功
        case 'onConnect':
          this.isHandleModbusConnect = false;
          clearTimeout(this.modbusConnectTimeout);
          this.$alert('连接成功', '连接成功', {
            confirmButtonText: '确定',
          });
          break;

        case 'onCheckSlaveAddr':
          if (errorCode) {
            console.log('onCheckSlaveAddr errorCode', errorCode);

            time = jsUtil.timestampToTime(new Date().getTime(), {
              isNotShowDate: true,
            });
            this.logDatas.unshift({
              time: `【${time}】`,
              log: `查询地址失败：【${connectionId}:地址${this.checkModbusSlaveAddr}】`,
            });

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
          time = jsUtil.timestampToTime(new Date().getTime(), {
            isNotShowDate: true,
          });
          this.logDatas.unshift({
            time: `【${time}】`,
            log: `查询地址成功：【${connectionId}:地址${this.checkModbusSlaveAddr}】`,
          });
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
        // 读保存寄存器完成
        case 'onReadHoldingRegisters':
          console.log('this.regDatas', this.regDatas);
          console.log('requestInfo', requestInfo);

          this.isHandleModbusHoldingRegisters = false;

          //记录modbus日志
          this.modbusLog(requestInfo);

          if (errorCode) {
            console.log('onReadHoldingRegisters errorCode', errorCode);
            return;
          }

          this.$message({
            message: '读取成功',
            type: 'success',
          });

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
          this.isHandleModbusHoldingRegisters = false;

          //记录modbus日志
          this.modbusLog(requestInfo);

          if (errorCode) {
            console.log('onWriteHoldingRegisters errorCode', errorCode);
            this.$alert('写入失败', '提示', {
              confirmButtonText: '确定',
            });
            return;
          }

          this.$message({
            message: '写入成功',
            type: 'success',
          });

          let regAddr = requestInfo.regAddr;

          regDataList = this.regDataList[connectionId][requestInfo.slaveAddr];

          // 字节数组转为buffer
          requestBuf = Buffer.from(requestInfo.requestBuf);
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
          time = jsUtil.timestampToTime(new Date().getTime(), {
            isNotShowDate: true,
          });
          this.logDatas.unshift({
            time: `【${time}】`,
            log: `${params.host}:${params.port} connected`,
          });

          break;

        // 客户端关闭
        case 'onClose':
          console.log('onClose'); // Prints 'whoooooooh!'

          time = jsUtil.timestampToTime(new Date().getTime(), {
            isNotShowDate: true,
          });
          this.logDatas.unshift({
            time: `【${time}】`,
            log: `${params.host}:${params.port} close`,
          });

          break;

        default:
          break;
      }
    });
  },
};
</script>

<style scoped lang="scss">
.padding {
  padding: 0 15px;
}

.container {
  height: 100vh;
}

//日志栏
.log-sidebar {
  height: 100%;
  overflow: hidden;
}

//侧边栏滚动条
//避免出现横向滚动条
.log-sidebar .el-scrollbar__wrap {
  overflow-x: hidden !important;
}
//高度设为100，才能竖向滚动
.el-scrollbar {
  height: 100% !important;
}
</style>
