import type http from 'node:http'

import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import type { Socket as SocketIOSocket } from 'socket.io'

import type { ClientEvents, ServerEvents } from '@listen-app/common'

import type { Config } from '#config.js'
import type Mailer from '#mailer.js'
import type RedisConnection from '#redis.js'
import type StreamInfoHandler from '#StreamInfoHandler.js'

import ChatManager from './ChatManager.js'
import StreamInfoDispatcher from './StreamInfoDispatcher.js'
import type AbstractHandler from './AbstractHandler.js'

class SocketIOManager {
  private config: Config
  private io: SocketIOServer | null = null
  private redis: RedisConnection
  private streamInfoHandler: StreamInfoHandler
  private mailer: Mailer
  private handlers: AbstractHandler[]

  constructor(
    config: Config,
    redis: RedisConnection,
    streamInfoHandler: StreamInfoHandler,
    mailer: Mailer
  ) {
    this.config = config
    this.redis = redis
    this.streamInfoHandler = streamInfoHandler
    this.mailer = mailer

    this.handlers = [StreamInfoDispatcher, ChatManager].map((Handler) => new Handler(this))
  }

  start(httpServer: http.Server) {
    this.io = new Server(httpServer, {
      serveClient: false, // don't serve client lib
    })

    // JWT auth
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token as unknown

      if (typeof token === 'string') {
        jwt.verify(token, this.config.jwtSecret, (err, decoded) => {
          if (
            err === null &&
            decoded &&
            typeof decoded === 'object' &&
            'user' in decoded &&
            decoded.user
          ) {
            // Auth success
            socket.data.user = decoded.user as UserData
          }
          next()
        })
      } else {
        // No token provided -> Guest
        next()
      }
    })

    // Init handler connection
    this.io.on('connection', (socket) => {
      for (const handler of this.handlers) {
        void (async () => {
          await handler.handleClientConnect(socket)
        })()
      }
    })
  }

  getServer(): SocketIOServer {
    if (!this.io) {
      throw new Error('SocketIO not initialized')
    }

    return this.io
  }

  getStreamInfoHandler(): StreamInfoHandler {
    return this.streamInfoHandler
  }

  getRedis(): RedisConnection {
    return this.redis
  }

  getMailer(): Mailer {
    return this.mailer
  }
}

interface UserData {
  /** email */
  id: string
  nickname: string
  email: string
}

interface SocketData {
  /** `undefined` means unauthenticated */
  user?: UserData
}

type SocketIOServer = Server<ClientEvents, ServerEvents, Record<string, never>, SocketData>
type Socket = SocketIOSocket<ClientEvents, ServerEvents, Record<string, never>, SocketData>

export type { Socket, SocketIOServer }
export default SocketIOManager
