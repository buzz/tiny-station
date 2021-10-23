import socketio from 'socket.io'

import ChatManager from './ChatManager'
import StreamInfoDispatcher from './StreamInfoDispatcher'
import UserManager from './UserManager'

const wrapMiddlewareForSocketIO = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next)

class SocketIOManager {
  passport = undefined

  handlers = []

  constructor(passport, redis, streamInfoFetcher) {
    this.passport = passport
    this.handlers = [
      new StreamInfoDispatcher(streamInfoFetcher),
      new ChatManager(redis),
      new UserManager(redis),
    ]
  }

  start(server) {
    const socketIO = socketio(server, {
      serveClient: false, // don't serve client lib
    })

    socketIO.use(wrapMiddlewareForSocketIO(this.passport.initialize()))

    // wrapMiddlewareForSocketIO(passport.authenticate('jwt', { session: false })),

    socketIO.on('connection', (socket) => {
      console.log('[SocketIOManager] client connect')
      this.handlers.forEach((h) => h.handleClientConnect(socketIO, socket))
    })
  }
}

export default SocketIOManager
