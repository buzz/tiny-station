import { EventEmitter } from 'events'
import https from 'https'
import { parse as parseDate } from 'date-format-parse'

const POLL_INTERVAL = 10 * 1000

class StreamInfoFetcher extends EventEmitter {
  streamInfo = {}

  url = ''

  pollingEnabled = false

  timeoutID = undefined

  constructor(url) {
    super()
    this.url = url
    this.createPollTimeout(0)
  }

  startPolling(immediatePoll = false) {
    if (!this.pollingEnabled) {
      this.pollingEnabled = true

      if (immediatePoll) {
        if (this.timeoutID) {
          clearTimeout(this.timeoutID)
        }
        this.createPollTimeout(0)
      }
    }
  }

  stopPolling() {
    this.pollingEnabled = false
  }

  createPollTimeout(interval = POLL_INTERVAL) {
    this.timeoutID = setTimeout(() => this.pollIcecast(), interval)
  }

  pollIcecast() {
    if (!this.pollingEnabled) {
      this.createPollTimeout()
      return
    }

    const newStreamInfo = {}

    const fetchPromise = new Promise((resolve) =>
      https.get(`${this.url}status-json.xsl`, (res) => {
        let body = ''
        res.on('data', (chunk) => {
          body += chunk
        })
        res.on('end', () => resolve(JSON.parse(body)))
      })
    )

    fetchPromise
      .then(({ icestats: { source } }) => {
        if (!source) {
          if (Object.prototype.hasOwnProperty.call(this.streamInfo, 'listenUrl')) {
            this.streamInfo = newStreamInfo
            this.emit('update', this.streamInfo)
          }
          return
        }

        const streamSource = Array.isArray(source) ? source[0] : source

        newStreamInfo.listeners = streamSource.listeners
        newStreamInfo.listenUrl = StreamInfoFetcher.rewriteListenUrl(streamSource.listenurl)
        newStreamInfo.title = streamSource.title
        newStreamInfo.streamStart = parseDate(source.stream_start, 'DD/MMM/YYYY:HH:mm:ss ZZ')

        // Did data change?
        if (
          this.streamInfo.listeners !== newStreamInfo.listeners ||
          this.streamInfo.listenUrl !== newStreamInfo.listenUrl ||
          this.streamInfo.title !== newStreamInfo.title ||
          this.streamInfo.streamStart.getTime() !== newStreamInfo.streamStart.getTime()
        ) {
          this.streamInfo = newStreamInfo
          this.emit('update', this.streamInfo)
        }
      })
      .catch((error) => {
        console.error('[StreamInfoFetcher] polling error')
        console.error(error)
        this.streamInfo = {}
        this.emit('update', this.streamInfo)
      })
      .finally(() => this.createPollTimeout())
  }

  static rewriteListenUrl(listenUrl) {
    // Working around bugged Icecast
    return listenUrl.replace('http://', 'https://')
  }

  getStreamInfo() {
    return this.streamInfo
  }
}

export default StreamInfoFetcher
