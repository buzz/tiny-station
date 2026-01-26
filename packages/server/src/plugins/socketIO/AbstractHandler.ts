import type { Socket, SocketIOServer } from './index.js'

abstract class AbstractHandler {
  constructor(protected io: SocketIOServer) {}

  abstract handleClientConnect(socket: Socket): Promise<void>
}

export default AbstractHandler
