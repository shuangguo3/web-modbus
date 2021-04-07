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
          :data="tableData"
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
              <p>姓名: {{ scope.row.log }}</p>
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

export default {
  name: 'AlarmPage',

  data() {
    return {
      activeName: 'second',

      //网络通讯日志
      netLog: [
        {
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄',
        },
        {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1517 弄',
        },
        {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1519 弄',
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1516 弄',
        },
      ],
    };
  },

  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
    },
  },

  created: function () {
    console.log('ipcRenderer', ipcRenderer);
    ipcRenderer.on('test', (event, message) => {
      console.log(message); // Prints 'whoooooooh!'
    });
  },
};
</script>

<style scoped>
</style>
