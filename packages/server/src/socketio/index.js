import socketio from 'socket.io'

import ChatManager from './ChatManager'
import StreamInfoDispatcher from './StreamInfoDispatcher'
import UserManager from './UserManager'

const wrapMiddlewareForSocketIO = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next)

class SocketIOManager {
  io = undefined

  passport = undefined

  passportAuthenticate = undefined

  redis = undefined

  streamInfoHandler = undefined

  mailer = undefined

  handlers = undefined

  constructor(passport, redis, streamInfoHandler, mailer) {
    this.passport = passport
    this.passportAuthenticate = wrapMiddlewareForSocketIO(
      passport.authenticate('jwt', { failWithError: true, session: false })
    )
    this.redis = redis
    this.streamInfoHandler = streamInfoHandler
    this.mailer = mailer

    this.handlers = [StreamInfoDispatcher, ChatManager, UserManager].map(
      (Handler) => new Handler(this)
    )
  }

  start(server) {
    this.io = socketio(server, {
      serveClient: false, // don't serve client lib
    })

    this.io.use(wrapMiddlewareForSocketIO(this.passport.initialize()))

    this.io.on('connection', (socket) => {
      console.log('[SocketIOManager] client connect')
      this.handlers.forEach((h) => h.handleClientConnect(socket))
    })
  }

  getIOSocket() {
    return this.io
  }

  getStreamInfoHandler() {
    return this.streamInfoHandler
  }

  getRedis() {
    return this.redis
  }

  getMailer() {
    return this.mailer
  }
}

export default SocketIOManager
