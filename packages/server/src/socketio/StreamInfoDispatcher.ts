import type { StreamInfo } from '@listen-app/common'

import AbstractHandler from './AbstractHandler.js'
import type { Socket } from './SocketIOManager.js'
import type SocketIOManager from './SocketIOManager.js'

const STREAM_INFO_ROOM = 'streamInfo'

class StreamInfoDispatcher extends AbstractHandler {
  constructor(manager: SocketIOManager) {
    super(manager)

    this.getStreamInfoHandler().on('update', (info: StreamInfo | null) => {
      this.onInfoUpdate(info)
    })
    this.getStreamInfoHandler().on('listeners', (count: number) => {
      this.onListenersUpdate(count)
    })
  }

  async handleClientConnect(socket: Socket) {
    await socket.join(STREAM_INFO_ROOM)

    socket.on('stream:request', () => {
      const streamInfoHandler = this.getStreamInfoHandler()
      socket.emit('stream:info', streamInfoHandler.getStreamInfo())
    })
  }

  onInfoUpdate(info: StreamInfo | null) {
    this.getIOServer().to(STREAM_INFO_ROOM).emit('stream:info', info)
  }

  onListenersUpdate(count: number) {
    this.getIOServer().to(STREAM_INFO_ROOM).emit('stream:listeners', count)
  }
}

export default StreamInfoDispatcher
