/* eslint-disable prefer-promise-reject-errors */

// socket tcp服务器

const net = require('net')
const port = 7777
let server = null

export default {
  StartServer () {
    server = net.createServer()
    server.on('connection', function (sock) {
      console.log('client connected, address - ', sock.remoteAddress, ' port - ', sock.remotePort)
      // sock.setEncoding('utf8')
      sock.on('data', function (data) {
        console.log('got data from client - ', data)
        sock.write('hello: ' + data)
      })
      sock.on('end', function () {
        console.log('client disconnected')
      })
      sock.on('error', function (err) {
        console.log('socket error - ', err)
      })
    })
    server.maxConnections = 10
    server.listen(port, function () {
      console.log('echo server bound at port - 7')
    })
  },

  StopServer () {
    server.close()
  }

}
