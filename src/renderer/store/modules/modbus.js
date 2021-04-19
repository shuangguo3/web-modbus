
const modbus = {
  state: {
    connectionList: {},
  },
  mutations: {
    newConnection: (state, connectionId) => {
      state.connectionList[connectionId] = true;
    },
    closeConnection: (state, connectionId) => {
      delete state.connectionList[connectionId];
    },

  },
  actions: {
    newConnection: ({ commit }, { connectionId }) => {
      commit('newConnection', connectionId);
    },
    closeConnection({ commit }, { connectionId }) {
      commit('closeConnection', connectionId);
    },

  },
};

export default modbus;
