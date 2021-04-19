<template>

  <div>

    <el-select
      v-model="value"
      placeholder="请选择"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      >
      </el-option>
    </el-select>

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
      value: '',
      options: [
        {
          value: '选项1',
          label: '黄金糕',
        },
        {
          value: '选项2',
          label: '双皮奶',
        },
        {
          value: '选项3',
          label: '蚵仔煎',
        },
        {
          value: '选项4',
          label: '龙须面',
        },
        {
          value: '选项5',
          label: '北京烤鸭',
        },
      ],

      modbusConnectionId: null,
      regDataList: {},
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
    ipcRenderer.on('modbus', (event, msg, params, requestInfo) => {
      console.log('modbus', msg, params, requestInfo); // Prints 'whoooooooh!'

      switch (msg) {
        case 'onReadHoldingRegisters':
          console.log('this.regDatas', this.regDatas);
          //regDataList = this.regDataList;
          const regDatas = this.regDatas;
          for (let regAddr in params) {
            const regValue = params[regAddr];

            // 检查去重
            if (this.regDataList[regAddr] === regValue) {
              continue;
            }
            this.regDataList[regAddr] = regValue;

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
          // 数组去重
          this.regDatas = regDatas;
          break;

        // 客户端已连接
        case 'onConnection':
          console.log('connect'); // Prints 'whoooooooh!'
          const time = jsUtil.timestampToTime(new Date().getTime());
          const log = `${params.ip}:${params.port} connected`;
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
