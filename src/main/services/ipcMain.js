import { ipcMain, dialog, BrowserWindow } from 'electron';
import Server from '../server/index';
import { winURL } from '../config/StaticPath';

import Store from 'electron-store';

const electronStore = new Store();

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

      if (params && params.connectionId) {

        modbusRtu = modbusTcp.rtuList[params.connectionId];
        if (!modbusRtu) {
          console.log('rtu not exist:', params.connectionId);
          return;
        }
      }

      let serverPort;

      switch (msg) {

        // 启动server
        case 'startServer':


          serverPort = electronStore.get('modbus.serverPort');

          modbusTcp.listen(serverPort, () => {

            global.windowList.mainWindow.webContents.send(
              'modbus',
              'onStartServer',
              { serverPort }
            );

          });
          break;

        // close server
        case 'closeServer':
          modbusTcp.closeServer(() => {

            global.windowList.mainWindow.webContents.send(
              'modbus',
              'onCloseServer'
            );

          });
          break;

        // 以client模式连接server
        case 'connect':

          modbusTcp.connect({
            host: params.host,
            port: params.port,
            callback: () => {
              global.windowList.mainWindow.webContents.send(
                'modbus',
                'onConnect'
              );
            },
          });
          break;

        // 获取server状态
        case 'getServerStatus':
          return modbusTcp.serverPort;

        // 获取连接列表
        case 'getConnectionList':
          console.log('getConnectionList', modbusTcp.connectionList);
          // event.returnValue = modbusTcp.connectionList;

          return modbusTcp.connectionList;
          // break;

        case 'checkSlaveAddr':

          // 调用rtu的读取保存寄存器方法
          modbusRtu.readHoldingRegisters({
            slaveAddr: params.slaveAddr,
            // 读取任意1个寄存器地址，如果超时表示：slaveaddr不存在
            regAddr: 0,
            regQuantity: 1,
            callback: (requestInfo) => {

              console.log('callback', requestInfo);
              // 读取保存寄存器成功后，调用rtu的获取寄存器值方法（把本次获取的寄存器值放入列表），并在回调函数里把寄存器值发送给渲染进程
              modbusRtu.getHoldingRegistersValue(() => {

                // 寄存器读取成功，表示当前slaveaddr存在，可正常调用
                global.windowList.mainWindow.webContents.send(
                  'modbus',
                  'onCheckSlaveAddr',
                  null,
                  {
                    host: modbusRtu.host,
                    port: modbusRtu.port,
                    connectionId: params.connectionId,

                    slaveAddr: params.slaveAddr,
                    regAddr: params.regAddr,
                    regQuantity: params.regQuantity,

                    requestBuf: requestInfo.requestBuf,
                    responseBuf: requestInfo.responseBuf,
                  }
                );

              });

            },
            errorCallback(errorCode, requestInfo) {
              console.log('errorCallback', errorCode, requestInfo);

              // 寄存器读取失败，表示当前slaveaddr不存在，不可调用
              global.windowList.mainWindow.webContents.send(
                'modbus',
                'onCheckSlaveAddr',
                null,
                {
                  errorCode, // 错误码

                  host: modbusRtu.host,
                  port: modbusRtu.port,
                  connectionId: params.connectionId,

                  slaveAddr: params.slaveAddr,
                  regAddr: params.regAddr,
                  regQuantity: params.regQuantity,

                  requestBuf: requestInfo.requestBuf,
                  responseBuf: requestInfo.responseBuf,
                }
              );

            },

          });
          break;


        case 'readHoldingRegisters':

          // 读保存寄存器

          // console.log('modbusRtu', modbusRtu);

          // 调用rtu的读保存寄存器方法
          modbusRtu.readHoldingRegisters({
            slaveAddr: params.slaveAddr,
            regAddr: params.regAddr,
            regQuantity: params.regQuantity,
            callback: (requestInfo) => {

              console.log('callback', requestInfo);
              // 读保存寄存器成功后，调用rtu的获取寄存器值方法（把本次获取的寄存器值放入列表），并在回调函数里把寄存器值发送给渲染进程
              modbusRtu.getHoldingRegistersValue((regInfos) => {

                console.log('modbusRtu.getHoldingRegistersValue regInfos', regInfos);

                // 把寄存器值发送给渲染进程
                global.windowList.mainWindow.webContents.send(
                  'modbus',
                  'onReadHoldingRegisters',
                  // requestInfo,
                  regInfos, // 返回寄存器值列表
                  // 只返回可序列化的请求信息（去掉不可序列化的回调函数等），否则无法进行进程间调用
                  {
                    host: modbusRtu.host,
                    port: modbusRtu.port,
                    connectionId: params.connectionId,

                    slaveAddr: params.slaveAddr,
                    regAddr: params.regAddr,
                    regQuantity: params.regQuantity,

                    requestBuf: requestInfo.requestBuf,
                    responseBuf: requestInfo.responseBuf,
                  }
                );

              });

            },
            errorCallback(errorCode, requestInfo) {
              console.log('errorCallback', errorCode, requestInfo);

              // 通知渲染进程，读取失败
              global.windowList.mainWindow.webContents.send(
                'modbus',
                'onReadHoldingRegisters',
                // requestInfo,
                null,
                {
                  errorCode, // 错误码

                  host: modbusRtu.host,
                  port: modbusRtu.port,
                  connectionId: params.connectionId,

                  slaveAddr: params.slaveAddr,
                  regAddr: params.regAddr,
                  regQuantity: params.regQuantity,

                  requestBuf: requestInfo.requestBuf,
                  responseBuf: requestInfo.responseBuf,
                }
              );
            },

          });
          break;

        case 'writeHoldingRegisters':

          // 写保存寄存器

          console.log('writeHoldingRegisters', params);

          // 调用rtu的写保存寄存器方法
          modbusRtu.writeHoldingRegisters({
            slaveAddr: params.slaveAddr,
            regAddr: params.regAddr,
            regQuantity: params.regQuantity,
            regValue: params.regValue,
            regValueBuf: params.regValueBuf,
            options: params.options,
            callback: (requestInfo) => {


              console.log('callback', requestInfo);

              // 通知渲染进程，写入成功
              global.windowList.mainWindow.webContents.send(
                'modbus',
                'onWriteHoldingRegisters',
                // requestInfo,
                null, // 返回寄存器值列表
                // 只返回可序列化的请求信息（去掉不可序列化的回调函数等），否则无法进行进程间调用
                {
                  host: modbusRtu.host,
                  port: modbusRtu.port,
                  connectionId: params.connectionId,

                  slaveAddr: params.slaveAddr,
                  regAddr: params.regAddr,
                  regQuantity: params.regQuantity,
                  regValueBuf: params.regValueBuf,

                  requestBuf: requestInfo.requestBuf,
                  responseBuf: requestInfo.responseBuf,
                }
              );


            },
            errorCallback(errorCode, requestInfo) {


              console.log('errorCallback', errorCode, requestInfo);

              // 通知渲染进程，写入失败
              global.windowList.mainWindow.webContents.send(
                'modbus',
                'onWriteHoldingRegisters',
                // requestInfo,
                null,
                {
                  errorCode, // 错误码

                  host: modbusRtu.host,
                  port: modbusRtu.port,
                  connectionId: params.connectionId,

                  slaveAddr: params.slaveAddr,
                  regAddr: params.regAddr,
                  regQuantity: params.regQuantity,

                  requestBuf: requestInfo.requestBuf,
                  responseBuf: requestInfo.responseBuf,

                }
              );


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
