import type { StreamInfo } from '@listen-app/common'

import { SOCKETIO_STREAM_INFO_ROOM } from '#constants.js'
import type StreamInfoHandler from '#plugins/streamInfo/StreamInfoHandler.js'

import AbstractHandler from './AbstractHandler.js'
import type { Socket, SocketIOServer } from './socketIOPlugin.ts'

class StreamInfoDispatcher extends AbstractHandler {
  constructor(
    io: SocketIOServer,
    private streamInfoHandler: StreamInfoHandler
  ) {
    super(io)

    this.streamInfoHandler.on('update', (info) => {
      this.onInfoUpdate(info)
    })
    this.streamInfoHandler.on('listeners', (listeners) => {
      this.onListenersUpdate(listeners)
    })
  }

  async handleClientConnect(socket: Socket) {
    await socket.join(SOCKETIO_STREAM_INFO_ROOM)

    socket.on('stream:request', () => {
      socket.emit('stream:info', this.streamInfoHandler.streamInfo)
    })
  }

  onInfoUpdate(info: StreamInfo | null) {
    this.io.to(SOCKETIO_STREAM_INFO_ROOM).emit('stream:info', info)
  }

  onListenersUpdate(count: number) {
    this.io.to(SOCKETIO_STREAM_INFO_ROOM).emit('stream:listeners', count)
  }
}

export default StreamInfoDispatcher
