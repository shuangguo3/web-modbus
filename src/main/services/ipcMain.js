import { ipcMain, dialog, BrowserWindow } from 'electron';
import Server from '../server/index';
import { winURL } from '../config/StaticPath';

const ModbusRtu = require('../../modbus/rtu.js');

export default {
  Mainfunc(mainWindow, IsUseSysTitle) {
    ipcMain.handle('IsUseSysTitle', async () => {
      return IsUseSysTitle;
    });
    ipcMain.handle('windows-mini', (event, args) => {
      BrowserWindow.fromWebContents(event.sender)?.minimize();
    });
    ipcMain.handle('window-max', async (event, args) => {
      if (BrowserWindow.fromWebContents(event.sender)?.isMaximized()) {
        BrowserWindow.fromWebContents(event.sender)?.restore();
        return { status: false };
      }
      BrowserWindow.fromWebContents(event.sender)?.maximize();
      return { status: true };

    });
    ipcMain.handle('window-close', (event, args) => {
      BrowserWindow.fromWebContents(event.sender)?.close();
    });
    ipcMain.handle('open-messagebox', async (event, arg) => {
      const res = await dialog.showMessageBox(mainWindow, {
        type: arg.type || 'info',
        title: arg.title || '',
        buttons: arg.buttons || [],
        message: arg.message || '',
        noLink: arg.noLink || true,
      });
      return res;
    });
    ipcMain.handle('open-errorbox', (event, arg) => {
      dialog.showErrorBox(
        arg.title,
        arg.message
      );
    });
    ipcMain.handle('start-server', async () => {
      try {
        const serveStatus = await Server.StartServer();
        console.log(serveStatus);
        return serveStatus;
      } catch (error) {
        dialog.showErrorBox(
          '错误',
          error
        );
      }
    });
    ipcMain.handle('stop-server', async (event, arg) => {
      try {
        const serveStatus = await Server.StopServer();
        return serveStatus;
      } catch (error) {
        dialog.showErrorBox(
          '错误',
          error
        );
      }
    });
    // modbus请求
    ipcMain.handle('modbus', async (event, msg, params) => {
      console.log('ipcMain modbus', msg, params);

      const modbusTcp = global.modbusTcp;
      let modbusRtu;

      switch (msg) {
        case 'createRtu':

          modbusRtu = new ModbusRtu({
            tcp: modbusTcp,
            // 通信对端的ip和端口，标识唯一的通信信道
            ip: params.ip,
            port: params.port,
          });
          return modbusRtu.connectionId;


        case 'ReadHoldingRegisters':

          modbusRtu = modbusTcp.rtuList[params.connectionId];
          if (!modbusRtu) return;

          modbusRtu.ReadHoldingRegisters({
            slaveAddr: params.slaveAddr,
            regAddr: params.regAddr,
            regQuantity: params.regQuantity,
            callback: (requestInfo) => {

              console.log('callback', requestInfo);


              // delete requestInfo.callback;
              // delete requestInfo.errorCallback;

              // requestInfo.requestBuf = requestInfo.requestBuf.toString();
              // requestInfo.responseBuf = requestInfo.responseBuf.toString();

              modbusRtu.getHoldingRegistersValue((regInfos) => {

                global.windowList.mainWindow.webContents.send(
                  'modbus',
                  'onReadHoldingRegisters',
                  // requestInfo,
                  regInfos, // 返回寄存器值数组
                  // 返回可序列化的请求信息（去掉不可序列化的回调函数）
                  {
                    slaveAddr: params.slaveAddr,
                    regAddr: params.regAddr,
                    regQuantity: params.regQuantity,
                  }
                  // requestInfo.requestBuf,
                  // requestInfo.responseBuf
                );

              });


              // arg.params.callback(requestInfo);
              // console.log('callback', requestInfo);

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
            },
            errorCallback(errorCode, requestInfo) {
              console.log('errorCallback', errorCode, requestInfo);
            },

          });
          break;

        default:
          break;
      }


    });

    ipcMain.handle('open-win', (event, arg) => {
      const ChildWin = new BrowserWindow({
        height: 595,
        useContentSize: true,
        width: 842,
        autoHideMenuBar: true,
        minWidth: 842,
        show: false,
        frame: IsUseSysTitle,
        webPreferences: {
          nodeIntegration: true,
          webSecurity: false,
          // 如果是开发模式可以使用devTools
          devTools: process.env.NODE_ENV === 'development',
          // devTools: true,
          // 在macos中启用橡皮动画
          scrollBounce: process.platform === 'darwin',
        },
      });
      ChildWin.loadURL(winURL + `#${arg.url}`);
      ChildWin.webContents.once('dom-ready', () => {
        ChildWin.show();
        ChildWin.webContents.send('send-data', arg.sendData);
        if (arg.IsPay) {
          // 检查支付时候自动关闭小窗口
          const testUrl = setInterval(() => {
            const Url = ChildWin.webContents.getURL();
            if (Url.includes(arg.PayUrl)) {
              ChildWin.close();
            }
          }, 1200);
          ChildWin.on('close', () => {
            clearInterval(testUrl);
          });
        }
      });
    });
  },
};
