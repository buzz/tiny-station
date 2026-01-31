import type { Config } from './plugins/config.js'
import type Mailer from './plugins/mailer/Mailer.ts'
import type RedisConnection from './plugins/redis/RedisConnection.ts'
import type { SocketIOServer } from './plugins/socketIO/socketIOPlugin.ts'
import type StreamInfoHandler from './plugins/streamInfo/StreamInfoHandler.ts'
import type { UserData } from './types.ts'

declare module 'fastify' {
  interface FastifyInstance {
    io: SocketIOServer
    redis: RedisConnection
    streamInfoHandler: StreamInfoHandler
    mailer: Mailer
    config: Config
  }

  interface FastifyRequest {
    user: UserData | null
  }
}
