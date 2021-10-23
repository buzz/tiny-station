class StreamInfoDispatcher {
  streamInfoFetcher = undefined

  constructor(streamInfoFetcher) {
    this.streamInfoFetcher = streamInfoFetcher
  }

  handleClientConnect(io, socket) {
    console.log('[StreamInfoDispatcher] handleClientConnect')

    socket.join('stream')

    socket.on('stream:request', () => {
      console.log('[StreamInfoDispatcher] stream:request')
      socket.emit('stream:info', this.streamInfoFetcher.getStreamInfo())
    })

    socket.on('disconnect', () => {
      console.log('[StreamInfoDispatcher] disconnect')
      this.checkPolling(io)
    })

    this.streamInfoFetcher.on('update', (info) => {
      console.log('[StreamInfoDispatcher] Got new stream info', info)
      io.to('stream').emit('stream:info', info)
    })

    this.checkPolling(io)
  }

  // Stop/start polling
  checkPolling(io) {
    const { rooms } = io.of('/').adapter
    const clientsCount = rooms.has('stream') ? rooms.get('stream').size : 0

    if (clientsCount > 0) {
      // Don't let the first client wait until next poll
      const info = this.streamInfoFetcher.getStreamInfo()
      const immediatePoll = clientsCount === 1 && !info.listenUrl
      this.streamInfoFetcher.startPolling(immediatePoll)
    } else {
      this.streamInfoFetcher.stopPolling()
    }
  }
}

export default StreamInfoDispatcher
