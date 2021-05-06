
// 初始化时此处代码，应该主动去读取一次modbus connectionList，避免丢失在渲染进程监听前的连接

const modbus = {
  state: {
    // 需要先主动去读取一次modbus connectionList，避免丢失渲染进程启动监听前的连接
    connectionList: {},
    serverPort: null,
  },
  mutations: {
    modbusConnection: (state, connectionList) => {
      state.connectionList = connectionList;
      console.log('mutations modbusConnection', state.connectionList);
    },
    modbusServer: (state, serverPort) => {
      state.serverPort = serverPort;
      console.log('mutations modbusServer', state.serverPort);
    },
  },
  actions: {
    modbusConnection: ({ commit }, { connectionList }) => {
      console.log('action modbusConnection', connectionList);
      commit('modbusConnection', connectionList);
    },
    modbusServer: ({ commit }, { serverPort }) => {
      console.log('action modbusConnection', serverPort);
      commit('modbusServer', serverPort);
    },


  },
};

export default modbus;
