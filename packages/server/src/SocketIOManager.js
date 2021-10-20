import socketio from 'socket.io'

class SocketIOManager {
  streamInfoFetcher = undefined

  socketIO = undefined

  connectedClients = 0

  constructor(server, streamInfoFetcher) {
    this.streamInfoFetcher = streamInfoFetcher
    this.setupSocketIO(server)

    this.streamInfoFetcher.on('update', (info) => {
      console.log('[SocketIOManager] got new stream info', info)

      this.socketIO.to('streamInfoUpdates').emit('streamInfo', info)
    })
  }

  setupSocketIO(server) {
    this.socketIO = socketio(server)

    this.socketIO.on('connection', (socket) => {
      socket.join('streamInfoUpdates')

      console.log('[SocketIOManager] client connect')

      socket.on('requestStreamInfo', () => {
        console.log('[SocketIOManager] requestStreamInfo')

        socket.emit('streamInfo', this.streamInfoFetcher.getStreamInfo())
      })

      socket.on('disconnect', () => {
        console.log('[SocketIOManager] disconnect')

        this.connectedClients += 1
        this.checkPolling()
      })

      this.connectedClients += 1
      this.checkPolling()
    })
  }

  // Stop/start polling
  checkPolling() {
    if (this.connectedClients > 0) {
      this.streamInfoFetcher.startPolling()
    } else {
      this.streamInfoFetcher.stopPolling()
    }
  }
}

// const makeSocketIo = (server, streamInfoFetcher) => {
//   let connectedClients = 0

//   const io = socketio(server)

//   streamInfoFetcher.on('update', (info) => {
//     console.log('got new stream info', info)

//     io.to('clients').emit('streamInfo', info)
//   })

//   io.on('connection', (socket) => {
//     connectedClients += 1

//     console.log('client connect')

//     socket.on('requestStreamInfo', () => {
//       console.log('requestStreamInfo')

//       socket.emit('streamInfo', streamInfoFetcher.getStreamInfo())
//     })

//     socket.on('disconnect', () => {
//       console.log('disconnect')

//       connectedClients += 1
//     })
//   })

//   return io
// }

export default SocketIOManager
