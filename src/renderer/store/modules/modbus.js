
// 初始化时此处代码，应该主动去读取一次modbus connectionList，避免丢失在渲染进程监听前的连接

const modbus = {
  state: {
    // 需要先主动去读取一次modbus connectionList，避免丢失在渲染进程监听前的连接
    connectionList: {},
  },
  mutations: {
    newConnection: (state, connectionList) => {

      state.connectionList = connectionList;
      console.log('mutations newConnection', state.connectionList);
    },
    closeConnection: (state, connectionList) => {
      state.connectionList = connectionList;
      console.log('mutations closeConnection', state.connectionList);
    },

  },
  actions: {
    newConnection: ({ commit }, { connectionList }) => {
      console.log('action newConnection', connectionList);
      commit('newConnection', connectionList);
    },
    closeConnection({ commit }, { connectionList }) {
      console.log('action closeConnection', connectionList);
      commit('closeConnection', connectionList);
    },

  },
};

export default modbus;
