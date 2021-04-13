import { ipcRenderer } from 'electron';
export default {
  send(name, data = {}) {
    return new Promise((resolve) => {
      ipcRenderer.invoke(name, data).then(res => {
        resolve(res);
      });
    });
  },
  remove(data) {
    ipcRenderer.removeAllListeners(data);
  },
};
