import AbstractHandler from './AbstractHandler'

const STREAM_INFO_ROOM = 'streamInfo'

class StreamInfoDispatcher extends AbstractHandler {
  constructor(manager) {
    super(manager)

    this.getStreamInfoFetcher().on('update', (info) => this.onInfoUpdate(info))
  }

  handleClientConnect(socket) {
    socket.join(STREAM_INFO_ROOM)

    const streamInfoFetcher = this.getStreamInfoFetcher()

    socket.on('stream:request', () => {
      socket.emit('stream:info', streamInfoFetcher.getStreamInfo())
    })

    socket.on('disconnect', () => {
      this.checkPolling()
    })

    this.checkPolling()
  }

  // Stop/start polling
  checkPolling() {
    const streamInfoFetcher = this.getStreamInfoFetcher()
    const clientsCount = this.getClientsNum(STREAM_INFO_ROOM)

    if (clientsCount > 0) {
      // Don't let the first client wait until next poll
      const info = streamInfoFetcher.getStreamInfo()
      const immediatePoll = clientsCount === 1 && !info.listenUrl
      streamInfoFetcher.startPolling(immediatePoll)
    } else {
      streamInfoFetcher.stopPolling()
    }
  }

  onInfoUpdate(info) {
    this.getIOSocket().to(STREAM_INFO_ROOM).emit('stream:info', info)
  }
}

export default StreamInfoDispatcher
