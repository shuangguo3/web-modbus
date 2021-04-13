/* eslint-disable prefer-promise-reject-errors */

// socket tcp服务器


const net = require('net');
const Modbus = require('modbus-pdu');
const port = 7777;
let server = null;

export default {
  StartServer() {
    server = net.createServer();
    server.on('connection', function(sock) {

      const connectMsg = 'client connected, address - ' + sock.remoteAddress + ' port - ' + sock.remotePort;
      global.windowList.mainWindow.webContents.send('modbus', 'connect', connectMsg);
      console.log(connectMsg);

      const buf = Modbus.ReadHoldingRegisters.Request.build(0x8008, 2);
      console.log(buf);

      sock.write(buf);

      // sock.setEncoding('utf8')
      sock.on('data', function(data) {
        console.log('got data from client - ', data);
        sock.write('hello: ' + data);
      });
      sock.on('end', function() {
        console.log('client disconnected');
      });
      sock.on('error', function(err) {
        console.log('socket error - ', err);
      });
    });
    server.maxConnections = 10;
    server.listen(port, function() {
      console.log('echo server bound at port - 7');
    });
    return server;
  },

  StopServer() {
    server.close();
  },

};


/*
Base Reads

readCoils (address = 0, quantity = 1)
readDiscreteInputs (address = 0, quantity = 1)
readHoldingRegisters (address = 0, quantity = 1)
readInputRegisters (address = 0, quantity = 1)
Base Writes

writeSingleCoil (address = 0, value = 0)
writeSingleRegister (address = 0, value = <Buffer 0x00 0x00>)
writeMultipleCoils (address = 0, values = [])
writeMultipleRegisters (address = 0, values = [ <Buffer 0x00 0x00> ])
File Records

readFileRecord (requests = [])
writeFileRecord (requests = [])
FIFO

readFifoQueue (address = 0)
Advanced

maskWriteRegister (address = 0, andmask = 0xFFFF, ormask = 0x0000)
readWriteMultipleRegisters (read_address = 0, read_quantity = 1, write_address = 0, values = [ <Buffer 0x00 0x00> ])
readDeviceIdentification (type = "BasicDeviceIdentification", id = "ProductName")
readExceptionStatus ()
getCommEventCounter ()
getCommEventLog ()


const modbus = require('modbus-stream');
const port = 7777;
let server = null;

export default {
  StartServer() {
    server = modbus.tcp.server({ debug: 'server' }, (connection) => {

      console.log('connection', connection);
      connection.readHoldingRegisters({ address: 0x8008, quantity: 2 }, (err, info) => {
        console.log('response', info);
      });
    });

    server.listen(port, () => {
      modbus.tcp.connect(port, { debug: 'client' }, (err, connection) => {


      });
    });
    return server;
  },

  StopServer() {
    server.close();
  },

};

*/
