import socketio from 'socket.io'

class SocketIOManager {
  handlers = []

  constructor(handlers) {
    this.handlers = handlers
  }

  start(server) {
    const socketIO = socketio(server)

    socketIO.on('connection', (socket) => {
      console.log('[SocketIOManager] client connect')
      this.handlers.forEach((handler) => handler.handleClientConnect(socketIO, socket))
    })
  }
}

export default SocketIOManager
