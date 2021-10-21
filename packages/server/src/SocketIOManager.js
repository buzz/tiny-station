import socketio from 'socket.io'

class SocketIOManager {
  streamInfoFetcher = undefined

  socketIO = undefined

  connectedClients = 0

  constructor(streamInfoFetcher) {
    this.streamInfoFetcher = streamInfoFetcher
  }

  start(server) {
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

    this.streamInfoFetcher.on('update', (info) => {
      console.log('[SocketIOManager] got new stream info', info)

      this.socketIO.to('streamInfoUpdates').emit('streamInfo', info)
    })
  }

  // Stop/start polling
  checkPolling() {
    if (this.connectedClients > 0) {
      // Don't let the first client wait until next poll
      const info = this.streamInfoFetcher.getStreamInfo()
      const immediatePoll = this.connectedClients === 1 && !info.listenUrl
      this.streamInfoFetcher.startPolling(immediatePoll)
    } else {
      this.streamInfoFetcher.stopPolling()
    }
  }
}

export default SocketIOManager
