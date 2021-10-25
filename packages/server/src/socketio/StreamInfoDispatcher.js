import AbstractHandler from './AbstractHandler'

const STREAM_INFO_ROOM = 'streamInfo'

class StreamInfoDispatcher extends AbstractHandler {
  constructor(manager) {
    super(manager)

    this.getStreamInfoHandler().on('update', (info) => this.onInfoUpdate(info))
    this.getStreamInfoHandler().on('listeners', (count) => this.onListenersUpdate(count))
  }

  handleClientConnect(socket) {
    socket.join(STREAM_INFO_ROOM)

    socket.on('stream:request', () => {
      const streamInfoHandler = this.getStreamInfoHandler()
      socket.emit('stream:info', streamInfoHandler.getStreamInfo())
      socket.emit('stream:listeners', streamInfoHandler.getListenerCount())
    })
  }

  onInfoUpdate(info) {
    this.getIOSocket().to(STREAM_INFO_ROOM).emit('stream:info', info)
  }

  onListenersUpdate(count) {
    this.getIOSocket().to(STREAM_INFO_ROOM).emit('stream:listeners', count)
  }
}

export default StreamInfoDispatcher
