<template>

  <div>

    <el-button
      type="primary"
      round
      @click="StartNetServer"
    >启动tcp服务端</el-button>
    <el-button
      type="primary"
      round
      @click="StopNetServer"
    >关闭tcp服务端</el-button>

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
        label="读线圈"
        name="second"
      >读线圈</el-tab-pane>
      <el-tab-pane
        label="读输入离散量"
        name="third"
      >读输入离散量</el-tab-pane>
      <el-tab-pane
        label="读多个寄存器"
        name="fourth"
      >读多个寄存器</el-tab-pane>
      <el-tab-pane
        label="读输入寄存器"
        name="five"
      >读输入寄存器</el-tab-pane>
    </el-tabs>

  </div>

</template>

<script>
const { ipcRenderer } = require('electron');

import jsUtil from '@/utils/jsUtil.js';

export default {
  name: 'AlarmPage',

  data() {
    return {
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

    //启动tcp server
    StartNetServer() {
      console.log('StartNetServer');
      this.$ipcApi.send('start-net-server').then((res) => {
        if (res) {
          this.$message({
            type: 'success',
            message: res,
          });
        }
      });
    },
    //停止tcp server
    StopNetServer() {
      this.$ipcApi.send('stop-net-server').then((res) => {
        this.$message({
          type: 'success',
          message: '已关闭',
        });
      });
    },
  },

  created: function () {
    console.log('ipcRenderer', ipcRenderer);
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
