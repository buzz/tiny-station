import fastifyPlugin from 'fastify-plugin'
import { Server } from 'socket.io'
import type { Socket as SocketIOSocket } from 'socket.io'

import type { ClientEvents, ServerEvents } from '@listen-app/common'

import { isObject, verifyJwt } from '#utils.js'
import type { UserData } from '#types.js'

import ChatManager from './ChatManager.js'
import StreamInfoDispatcher from './StreamInfoDispatcher.js'
import type AbstractHandler from './AbstractHandler.js'

function hasAuthToken(auth: unknown): auth is AuthWithToken {
  return isObject(auth) && auth.token === 'string' && auth.token.length > 0
}

const socketIOPlugin = fastifyPlugin((fastify) => {
  const handlers: AbstractHandler[] = [
    new StreamInfoDispatcher(fastify.io, fastify.streamInfoHandler),
    new ChatManager(fastify.io, fastify.redis),
  ]

  fastify
    .decorate('io', new Server(fastify.server, { serveClient: false }))

    .addHook('preClose', () => {
      fastify.io.local.disconnectSockets(true)
    })

    .addHook('onClose', async () => {
      await fastify.io.close()
    })

    .after(() => {
      // JWT auth
      fastify.io.use((socket, next) => {
        const { auth } = socket.handshake
        if (hasAuthToken(auth)) {
          verifyJwt(auth.token, fastify.config.jwtSecret)
            .then((userData) => {
              socket.data.user = userData
              next()
            })
            .catch(() => {
              // Token verification failed
              next()
            })
        } else {
          // No token provided -> Guest
          next()
        }
      })

      // Pass client connection to handlers
      fastify.io.on('connection', (socket: Socket) => {
        fastify.log.debug('SocketIO client connected')
        for (const handler of handlers) {
          void handler.handleClientConnect(socket)
        }
      })
    })
})

interface SocketData {
  /** `undefined` means unauthenticated */
  user?: UserData
}

type SocketIOServer = Server<ClientEvents, ServerEvents, Record<string, never>, SocketData>
type Socket = SocketIOSocket<ClientEvents, ServerEvents, Record<string, never>, SocketData>

interface AuthWithToken {
  token: string
}

export type { Socket, SocketIOServer }
export default socketIOPlugin
