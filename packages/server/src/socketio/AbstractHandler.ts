import type Mailer from '#mailer.js'
import type RedisConnection from '#redis.js'
import type StreamInfoHandler from '#StreamInfoHandler.js'

import type { Socket, SocketIOServer } from './SocketIOManager.js'
import type SocketIOManager from './SocketIOManager.js'

abstract class AbstractHandler {
  private manager: SocketIOManager

  constructor(manager: SocketIOManager) {
    this.manager = manager
  }

  abstract handleClientConnect(socket: Socket): Promise<void>

  // TODO: unused?
  // getClientsNum(room) {
  //   const { rooms } = this.getIOServer().of('/').adapter
  //   return rooms.has(room) ? rooms.get(room).size : 0
  // }

  getIOServer(): SocketIOServer {
    return this.manager.getServer()
  }

  getStreamInfoHandler(): StreamInfoHandler {
    return this.manager.getStreamInfoHandler()
  }

  getRedis(): RedisConnection {
    return this.manager.getRedis()
  }

  getMailer(): Mailer {
    return this.manager.getMailer()
  }
}

export default AbstractHandler
