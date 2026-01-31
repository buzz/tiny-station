import type { Socket, SocketIOServer } from './socketIOPlugin.ts'

abstract class AbstractHandler {
  constructor(protected io: SocketIOServer) {}

  abstract handleClientConnect(socket: Socket): Promise<void>
}

export default AbstractHandler
