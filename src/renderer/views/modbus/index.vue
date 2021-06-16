<template>

  <el-container class="container">

    <el-container>

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

                  <div style="padding: 15px; margin-top:20px; border:1px solid #ccc;">
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

                  <div style="padding: 15px 15px 0; margin-top:20px; border:1px solid #ccc;">
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
                        @click="handleModbusStartClient"
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
                          :model="holdingRegistersModel"
                        >
                          <el-form-item label="地址（16进制）">
                            <el-input
                              style="width:80px"
                              v-model="holdingRegistersModel.regAddr"
                              placeholder="地址"
                            ></el-input>
                          </el-form-item>

                          <el-form-item label="数量（10进制）">
                            <el-input
                              style="width:80px"
                              v-model="holdingRegistersModel.regQuantity"
                              placeholder="数量"
                            ></el-input>
                          </el-form-item>

                          <el-form-item
                            v-if="(modbusFC === '0xf0' || modbusFC === '0x10')"
                            label="写入值（16进制）"
                          >
                            <el-input
                              style="width:80px"
                              v-model="holdingRegistersModel.regValue"
                              placeholder="值"
                            ></el-input>
                          </el-form-item>

                          <el-form-item>
                            <el-select
                              style="width:170px"
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

                          <el-form-item
                            style="display:block;"
                            v-if="modbusFC == '0x10'"
                          >
                            <el-tooltip
                              v-show="modbusFC == '0x10'"
                              effect="dark"
                              content="默认每个地址写入同样的值，如果需要随着地址递增，寄存器值也递增，就勾选此项"
                              placement="bottom-start"
                            >
                              <el-checkbox
                                label="寄存器值递增"
                                v-model="holdingRegistersModel.options.isValueInc"
                              ></el-checkbox>
                            </el-tooltip>

                            <el-tooltip
                              v-show="modbusFC == '0x10' && holdingRegistersModel.options.isValueInc"
                              effect="dark"
                              content="寄存器值递增时，需要跳过 A~F 的16进制值，就勾选此项"
                              placement="bottom-start"
                            >
                              <el-checkbox
                                label="寄存器值跳过16进制"
                                v-model="holdingRegistersModel.options.isValueSkip16"
                              ></el-checkbox>
                            </el-tooltip>
                            <!--
                            <el-tooltip
                              v-show="modbusFC == '0x10'"
                              effect="dark"
                              content="某些小厂家的modbus实现有bug，所以modbus响应只简单检查slave地址，功能码等，如果要严格按照modbus协议检查响应，就勾选此项"
                              placement="bottom-start"
                            >
                              <el-checkbox
                                label="严格检查modbus响应"
                                v-model="holdingRegistersModel.options.isCheckResponse"
                              ></el-checkbox>
                            </el-tooltip>
                            -->

                          </el-form-item>

                          <br />
                          <el-form-item>
                            <el-button
                              type="primary"
                              @click="handleExportHoldingRegisters"
                            >导出寄存器值到文件</el-button>
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
                        <el-table-column
                          fixed="right"
                          label="操作"
                          width="100"
                        >
                          <template slot-scope="scope">
                            <el-button
                              @click="handleDeleteReg(scope.row, connection.host, connection.port, addr)"
                              type="text"
                              size="small"
                            >删除</el-button>
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
      <el-footer
        height="30px"
        class="status"
      >产品主页：https://github.com/shuangguo3/web-modbus （请保留此版权信息）</el-footer>
    </el-container>

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
              <div
                v-if="scope.row.time"
                :class="scope.row.isError?'log-error':''"
              >{{ scope.row.time }}</div>
              <div
                v-if="scope.row.log"
                :class="scope.row.isError?'log-error':''"
              >{{ scope.row.log }}</div>
              <div v-if="scope.row.requestStr">{{ scope.row.requestStr }}</div>
              <div v-if="scope.row.responseStr">{{ scope.row.responseStr }}</div>
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>
    </el-aside>

    <!--导出文件对话框-->
    <el-dialog
      title="导出文件"
      :close-on-click-modal="false"
      :before-close="handleCloseExportDialog"
      :visible.sync="isExportHoldingRegistersDialogVisible"
    >
      <el-form
        :model="HoldingRegistersExportModel"
        size="small"
      >

        <el-form-item>
          <el-alert
            title="把寄存器值导出到文件中"
            type="success"
          >
          </el-alert>
        </el-form-item>

        <el-form-item label="寄存器起始地址（16进制）">
          <el-input
            v-model="HoldingRegistersExportModel.startRegAddr"
            autocomplete="off"
            placeholder="起始地址"
          ></el-input>
        </el-form-item>

        <el-form-item label="寄存器结束地址（16进制）">
          <el-input
            v-model="HoldingRegistersExportModel.endRegAddr"
            autocomplete="off"
            placeholder="结束地址"
          ></el-input>
        </el-form-item>

        <el-form-item label="每次读取寄存器数量（1 ~ 125）">

          <el-input
            v-model="HoldingRegistersExportModel.regQuantity"
            autocomplete="off"
            placeholder="每次读取寄存器数量"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :icon="isExportingFile?'el-icon-loading':''"
            @click="handleExportFile"
          >{{isExportingFile?'停止导出':'开始导出'}}</el-button>
        </el-form-item>

        <el-form-item>
          <ul>
            <li>自动循环读取寄存器值，读取成功后，写入文件</li>
            <li>导出文件路径：{当前执行程序路径}/export/holdingRegister/{起始地址}_{结束地址}_{导出时间}.txt</li>
          </ul>

        </el-form-item>

      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="handleCloseExportDialog">关闭</el-button>
      </div>
    </el-dialog>

    <!--删除寄存器数据对话框-->
    <el-dialog
      title="删除确认"
      :visible.sync="isDelRegDataDialogVisible"
    >
      <el-form>
        <el-form-item label-width="50">
          <el-alert
            title="此操作将删除当前地址的值，并且把后面地址的值往前移动"
            type="warning"
          >
          </el-alert>
        </el-form-item>
        <el-form-item
          label="移动数量"
          label-width="50"
        >
          <el-input v-model="delRegDataForm.offsetRegQuantity"></el-input>
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="isDelRegDataDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="handleDoDelRegData"
        >确 定</el-button>
      </div>
    </el-dialog>

  </el-container>

</template>

<script>
import fs from 'fs';

import { ipcRenderer } from 'electron';

import jsUtil from '@/utils/jsUtil.js';

import Store from 'electron-store';

import { exception as modbusException } from 'wtcp-modbus';

export default {
  name: 'AlarmPage',

  data() {
    return {
      //modbus只使用ip作为连接id
      isModbusOnlyIp: true,

      curModbusConnectionId: '',
      curModbusAddr: '',

      // 导出HoldingRegisters寄存器值对话框
      isExportHoldingRegistersDialogVisible: false,

      // 删除寄存器值对话框
      isDelRegDataDialogVisible: false,

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

      isHandleModbusHoldingRegisters: false, //正在读写保存寄存器
      //isHandleModbusCoils: false, //正在读写线圈

      //正在导出文件过程中
      isExportingFile: false,
      exportFileFd: null,
      exportStartRegAddr: null,
      exportEndRegAddr: null,
      exportRegQuantity: null,

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

      // 删除寄存器数据
      isDelRegData: false, // 正在删除寄存器数据标志
      delRegDataForm: {
        offsetRegQuantity: 60, //需要往前移动的寄存器数量，默认60，最大120

        regAddr: null, //需要删除的寄存器地址
      },

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
      holdingRegistersModel: {
        regAddr: '',
        regValue: '',
        regQuantity: '',
        options: {
          isValueSkip16: true,
          isValueInc: false, //写入时，寄存器值是否递增
          isCheckResponse: false,
        },
      },

      //寄存器导出
      HoldingRegistersExportModel: {
        startRegAddr: '', //起始地址
        endRegAddr: '', //结束地址
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
    //modbus server端口改变
    '$store.state.modbus.serverPort': {
      immediate: true,
      handler(modbusServerPort) {
        this.modbusServerPort = modbusServerPort;
      },
    },
    //modbus 连接列表改变
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
    logDatas(val) {
      if (val.length > 1000) {
        val.splice(1000);
      }
    },
  },

  methods: {
    //删除寄存器数据
    handleDeleteReg(row, host, port, addr) {
      this.delRegDataForm.regAddr = Number.parseInt(row.regAddr, 16);

      this.delRegDataForm.host = host;
      this.delRegDataForm.port = port;
      this.delRegDataForm.slaveAddr = addr;

      this.isDelRegDataDialogVisible = true;
    },

    //执行删除
    handleDoDelRegData() {
      // 读取输入数量的寄存器，把后面的寄存器数据往前移动后，再重新写入

      const offsetRegQuantity = parseInt(this.delRegDataForm.offsetRegQuantity);
      if (!offsetRegQuantity || offsetRegQuantity > 120) {
        this.$message({
          message: '移动数量必须是数字，且必须小于120',
          type: 'warning',
        });
        return;
      }

      /*
      const loading = this.$loading({
          lock: true,
          text: '删除中...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        setTimeout(() => {
          loading.close();
        }, 2000);
        */

      this.isDelRegDataDialogVisible = false;

      const params = this.getSlaveParams(
        this.delRegDataForm.host,
        this.delRegDataForm.port,
        this.delRegDataForm.slaveAddr
      );
      const modbusParams = {
        regAddr: this.delRegDataForm.regAddr,
        regQuantity: offsetRegQuantity,
        regValueBuf: null,
        options: {},
      };

      Object.assign(params, modbusParams);

      console.log('handleDoDelRegData', params);

      // 设置删除寄存器数据标志
      this.isDelRegData = true;

      ipcRenderer.invoke('modbus', 'readHoldingRegisters', params);
    },

    // 关闭导出对话框
    handleCloseExportDialog() {
      if (!this.isExportingFile) {
        this.isExportHoldingRegistersDialogVisible = false;
        return;
      }

      this.$confirm('是否停止导出文件，并关闭当前窗口?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isExportHoldingRegistersDialogVisible = false;
      });
    },

    // 处理寄存器值导出
    handleExportFile() {
      if (this.isExportingFile) {
        this.isExportingFile = false;
        return;
      }

      if (!this.HoldingRegistersExportModel.startRegAddr) {
        this.$alert('请输入起始地址', '输入异常', {
          type: 'error',
          confirmButtonText: '确定',
        });
        return;
      }
      const startRegAddr = Number.parseInt(
        this.HoldingRegistersExportModel.startRegAddr,
        16
      );
      if (startRegAddr > 0xffff) {
        this.$alert('起始地址异常，地址范围0x0000 至 0xFFFF', '输入异常', {
          type: 'error',
          confirmButtonText: '确定',
        });
        return;
      }

      if (!this.HoldingRegistersExportModel.endRegAddr) {
        this.$alert('请输入结束地址', '输入异常', {
          type: 'error',
          confirmButtonText: '确定',
        });
        return;
      }
      const endRegAddr = Number.parseInt(
        this.HoldingRegistersExportModel.endRegAddr,
        16
      );
      if (endRegAddr > 0xffff) {
        this.$alert('结束地址异常，地址范围0x0000 至 0xFFFF', '输入异常', {
          type: 'error',
          confirmButtonText: '确定',
        });
        return;
      }

      if (!this.HoldingRegistersExportModel.regQuantity) {
        this.$alert('请输入每次读取数量', '输入异常', {
          type: 'error',
          confirmButtonText: '确定',
        });
        return;
      }
      const regQuantity = Number.parseInt(
        this.HoldingRegistersExportModel.regQuantity,
        16
      );
      if (regQuantity > 125 || regQuantity <= 0) {
        this.$alert('读取数量，数量范围1 ~ 125', '输入异常', {
          type: 'error',
          confirmButtonText: '确定',
        });
        return;
      }

      if (endRegAddr < startRegAddr) {
        this.$alert('结束地址必须大于起始地址', '输入异常', {
          type: 'error',
          confirmButtonText: '确定',
        });
        return;
      }

      const exportPath = 'export/holdingRegister';
      jsUtil.mkdirsSync(exportPath);
      let time = jsUtil.timestampToTime(new Date().getTime());
      time = time.replace(/\:/g, '-');
      time = time.replace(' ', '');
      const exportFile =
        exportPath +
        `/${this.HoldingRegistersExportModel.startRegAddr}_${this.HoldingRegistersExportModel.endRegAddr}_${time}.txt`;

      console.log('exportFile', exportFile);

      this.exportFildFd = fs.openSync(exportFile, 'a');
      if (!this.exportFildFd) {
        this.$alert('打开文件失败', '程序异常', {
          type: 'error',
          confirmButtonText: '确定',
        });
        return;
      }

      this.isExportingFile = true;
      this.exportStartRegAddr = startRegAddr;
      this.exportEndRegAddr = endRegAddr;
      this.exportRegQuantity = regQuantity;

      this.exportReadHoldingRegisters();
    },

    //导出文件过程中，读取保存寄存器
    exportReadHoldingRegisters() {
      console.log(
        'exportReadHoldingRegisterst',
        this.exportStartRegAddr,
        this.exportEndRegAddr
      );
      if (this.exportStartRegAddr >= this.exportEndRegAddr) {
        this.isExportingFile = false;
        fs.closeSync(this.exportFildFd);
        this.exportFildFd = null;

        this.$alert('导出成功', '提示', {
          confirmButtonText: '确定',
        });

        return;
      }

      const hostPortArr = this.curModbusConnectionId.split(':');
      const host = hostPortArr[0];
      const port = hostPortArr[1];

      const params = this.getSlaveParams(host, port, this.curModbusAddr);
      const modbusParams = {
        regAddr: this.exportStartRegAddr,
        regQuantity:
          this.exportEndRegAddr - this.exportStartRegAddr >
          this.exportRegQuantity
            ? this.exportRegQuantity
            : this.exportEndRegAddr - this.exportStartRegAddr + 1,
      };
      Object.assign(params, modbusParams);

      ipcRenderer.invoke('modbus', 'readHoldingRegisters', params);

      this.exportStartRegAddr += modbusParams.regQuantity;
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
    handleModbusStartClient() {
      if (!this.modbusClientModel.host) {
        this.$alert('请输入主机地址', '输入异常', {
          type: 'error',
          confirmButtonText: '确定',
        });
        return;
      }
      if (!this.modbusClientModel.port) {
        this.$alert('请输入主机端口', '输入异常', {
          type: 'error',
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
            type: 'error',
            confirmButtonText: '确定',
          });
          return;
        }
      }

      this.isHandleModbusConnect = true;
      ipcRenderer.invoke('modbus', 'startClient', this.modbusClientModel);
      this.modbusConnectTimeout = setTimeout(() => {
        this.$alert('请检查主机状态', '连接失败', {
          type: 'error',
          confirmButtonText: '确定',
        });
        this.isHandleModbusConnect = false;
      }, 2000);
    },

    // modbus连接tab点击切换
    handleModbusConnectionClick(tab, event) {
      //console.log(tab, event);
      console.log(tab.name, tab.label);
      if (tab.name === 'connect') return;
      this.curModbusConnectionId = tab.name;
    },

    // modbus地址，tab点击切换
    handleModbusAddrClick(tab, event) {
      this.curModbusAddr = tab.name;
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
      console.log('holdingRegistersModel', this.holdingRegistersModel);

      if (!this.holdingRegistersModel.regAddr) {
        this.$alert('请输入寄存器地址', '输入异常', {
          type: 'error',
          confirmButtonText: '确定',
        });
        return;
      }
      if (!this.holdingRegistersModel.regQuantity) {
        this.$alert('请输入寄存器数量', '输入异常', {
          type: 'error',
          confirmButtonText: '确定',
        });
        return;
      }

      const regAddr = Number.parseInt(this.holdingRegistersModel.regAddr, 16);
      const regQuantity = Number.parseInt(
        this.holdingRegistersModel.regQuantity,
        10
      );
      const options = this.holdingRegistersModel.options;
      let regValue, regValueBuf;

      //如果是写入寄存器
      if (this.modbusFC == '0x10') {
        if (!this.holdingRegistersModel.regValue) {
          this.$alert('请输入寄存器值', '输入异常', {
            type: 'error',
            confirmButtonText: '确定',
          });
          return;
        }

        regValue = Number.parseInt(this.holdingRegistersModel.regValue, 16);

        //生成寄存器值缓冲区
        regValueBuf = Buffer.allocUnsafe(regQuantity * 2);

        // 设置寄存器值
        // 如果传入了第一个寄存器值，表示后续的寄存器值依次递增来设置
        if (Number.isInteger(regValue)) {
          let curRegValue = regValue;
          for (let i = 0; i < regQuantity; i++) {
            console.log('writeUIntBE', curRegValue, 7 + i);

            // 是否跳过16进制的a~f
            if (options.isValueInc && options.isValueSkip16) {
              if (curRegValue % 0x10 >= 0xa) {
                curRegValue += 6;
              }
              if (curRegValue % 0x100 >= 0xa0) {
                curRegValue += 6 * 16;
              }
              if (curRegValue % 0x1000 >= 0xa00) {
                curRegValue += 6 * 256;
              }
            }

            if (options.isValueSkip16) {
              //
              if (curRegValue >= 0x9999) {
                curRegValue = 0x9999;
              }
            } else {
              if (curRegValue >= 0xffff) {
                curRegValue = 0xffff;
              }
            }

            regValueBuf.writeUIntBE(curRegValue, i * 2, 2);

            if (options.isValueInc) {
              curRegValue++;
            }
          }
        }
      }

      this.isHandleModbusHoldingRegisters = true;

      console.log('regValueBuf', regValueBuf);

      const params = this.getSlaveParams(host, port, slaveAddr);
      const modbusParams = {
        regAddr,
        regQuantity,
        regValueBuf,
        options,
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

    handleExportHoldingRegisters() {
      //弹出导出文件对话框
      this.isExportHoldingRegistersDialogVisible = true;
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

    //modbus错误日志
    modbusErrorLog(errorCode) {
      console.log('modbusErrorLog', errorCode);
      let log = '【modbus异常】错误码：';
      switch (errorCode) {
        case modbusException.IllegalFunction:
          log += `IllegalFunction`;
          break;

        case modbusException.IllegalDataAddress:
          log += 'IllegalDataAddress';
          break;

        case modbusException.IllegalDataValue:
          log += 'IllegalDataValue';
          break;

        case modbusException.ServerDeviceFailure:
          log += 'ServerDeviceFailure';
          break;

        case modbusException.Aknowledge:
          log += 'Aknowledge';
          break;

        case modbusException.ServerDeviceBusy:
          log += 'ServerDeviceBusy';
          break;

        case modbusException.MemoryParityError:
          log += 'MemoryParityError';
          break;

        case modbusException.GatewayPathUnavailable:
          log += 'GatewayPathUnavailable';
          break;

        case modbusException.GatewayTargetDeviceFailedToRespond:
          log += 'GatewayTargetDeviceFailedToRespond';
          break;

        case modbusException.RequestTimeout:
          log += 'RequestTimeout';
          break;

        case modbusException.RecvDataError:
          log += 'RecvDataError';
          break;

        case modbusException.CrcError:
          log += 'CrcError';
          break;

        default:
          break;
      }

      const time = jsUtil.timestampToTime(new Date().getTime(), {
        isNotShowDate: true,
      });
      this.logDatas.unshift({
        isError: true,
        time: `【${time}】`,
        log,
      });

      this.$message({
        message: '操作失败，详细错误信息请查看日志',
        type: 'error',
      });
    },

    //modbus日志
    modbusLog(requestInfo) {
      //const requestBuf = Buffer.from(requestInfo.requestBuf);
      //const responseBuf = Buffer.from(requestInfo.responseBuf);
      const requestBuf = requestInfo.requestBuf;
      const responseBuf = requestInfo.responseBuf;

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
    this.modbusServerModel.serverPort =
      this.electronStore.get('modbus.serverPort');

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
        if (errorCode) {
          this.modbusErrorLog(errorCode);
        }
        // 获取完整的连接id，区别于requestInfo.connectionId（可能只有ip）
        connectionId = `${requestInfo.host}:${requestInfo.port}`;

        console.log('requestInfo.requestBuf', requestInfo.requestBuf);
        console.log('requestInfo.responseBuf', requestInfo.responseBuf);

        //转换缓存区
        requestInfo.requestBuf = Buffer.from(requestInfo.requestBuf);
        requestInfo.responseBuf = Buffer.from(requestInfo.responseBuf);
      }

      switch (msg) {
        // server 启动成功
        case 'onStartServer':
        // server已关闭
        case 'onCloseServer':
          this.isHandleModbusServer = false;
          break;

        //以client模式，连接成功
        case 'onStartClient':
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
              isError: true,
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
            this.curModbusAddr = this.modbusAddrTabActList[connectionId] =
              requestInfo.slaveAddr.toString();
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

          //如果正在导出文件过程中
          if (this.isExportingFile) {
            //没有发生异常，就把读取的寄存器值，写入文件
            if (errorCode) {
              this.$alert('读取寄存器异常，导出文件终止', '提示', {
                type: 'error',
                confirmButtonText: '确定',
              });
              this.isExportingFile = false;
              return;
            } else {
              console.log('params', params);
              for (let regAddr in params) {
                const regValue = Number(params[regAddr]).toString(16);
                regAddr = Number(regAddr).toString(16);
                console.log('writefile', `${regAddr}:${regValue}\r\n`);
                fs.writeSync(this.exportFildFd, `${regAddr}:${regValue}\r\n`);
              }

              //记录modbus日志
              this.modbusLog(requestInfo);
            }

            //继续读寄存器
            this.exportReadHoldingRegisters();

            return;
          }

          this.isHandleModbusHoldingRegisters = false;

          //记录modbus日志
          this.modbusLog(requestInfo);

          if (errorCode) {
            console.log('onReadHoldingRegisters errorCode', errorCode);
            return;
          }

          // 正在删除寄存器数据
          if (this.isDelRegData) {
            const offsetRegQuantity = parseInt(
              this.delRegDataForm.offsetRegQuantity
            );
            //生成寄存器值缓冲区
            const regValueBuf = Buffer.allocUnsafe(offsetRegQuantity * 2);

            console.log('requestInfo.responseBuf', requestInfo.responseBuf);

            // 设置寄存器值
            for (let i = 0; i < offsetRegQuantity - 1; i++) {
              // 从读响应缓存区，获取当前地址的下一个地址的数据
              // 响应缓存区的前3个字节为 1字节从机地址 1字节功能码 1字节字节数
              const offsetRegValue = requestInfo.responseBuf.readUIntBE(
                3 + i * 2 + 2,
                2
              );
              regValueBuf.writeUIntBE(offsetRegValue, i * 2, 2);
            }

            // 前面的数据往前移动一个地址，最后一个数据保持不变
            regValueBuf.writeUIntBE(
              requestInfo.responseBuf.readUIntBE(
                3 + (offsetRegQuantity - 1) * 2,
                2
              ),
              (offsetRegQuantity - 1) * 2,
              2
            );

            console.log('regValueBuf', regValueBuf);

            const params = this.getSlaveParams(
              this.delRegDataForm.host,
              this.delRegDataForm.port,
              this.delRegDataForm.slaveAddr
            );
            const modbusParams = {
              regAddr: this.delRegDataForm.regAddr,
              regQuantity: offsetRegQuantity,
              regValueBuf,
              options: {},
            };
            Object.assign(params, modbusParams);

            ipcRenderer.invoke('modbus', 'writeHoldingRegisters', params);

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
              type: 'error',
              confirmButtonText: '确定',
            });
            return;
          }

          if (this.isDelRegData) {
            this.isDelRegData = false;

            this.$message({
              message: '删除成功',
              type: 'success',
            });
          } else {
            this.$message({
              message: '写入成功',
              type: 'success',
            });
          }

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

.status {
  height: 30px;
  line-height: 30px;
  border: 1px solid #ddd;
}

.log-error {
  color: #f00;
}
</style>
