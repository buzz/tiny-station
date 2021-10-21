import { EventEmitter } from 'events'
import https from 'https'
import { parse as parseDate } from 'date-format-parse'

const POLL_INTERVAL = 10 * 1000

const isEmptyObject = (obj) =>
  obj && // null and undefined check
  Object.keys(obj).length === 0 &&
  Object.getPrototypeOf(obj) === Object.prototype

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

  startPolling() {
    console.log('[StreamInfoFetcher] polling started')

    this.pollingEnabled = true

    if (isEmptyObject(this.streamInfo)) {
      console.log('[StreamInfoFetcher] poll right away')

      if (this.timeoutID) {
        clearTimeout(this.timeoutID)
      }
      this.createPollTimeout(0)
    }
  }

  stopPolling() {
    console.log('[StreamInfoFetcher] polling stopped')

    this.pollingEnabled = false
  }

  createPollTimeout(interval = POLL_INTERVAL) {
    this.timeoutID = setTimeout(() => this.pollIcecast(), interval)
  }

  pollIcecast() {
    if (!this.pollingEnabled) {
      console.log('[StreamInfoFetcher] polling but disabled...')
      this.createPollTimeout()
      return
    }

    console.log('[StreamInfoFetcher] polling now...')

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
          console.log('[StreamInfoFetcher] polling result: stream offline')

          this.streamInfo = newStreamInfo
          this.emit('update', this.streamInfo)
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
          console.log('[StreamInfoFetcher] polling result: updated info')

          this.streamInfo = newStreamInfo
          this.emit('update', this.streamInfo)
        } else {
          console.log('[StreamInfoFetcher] polling result: old info')
        }
      })
      .catch((error) => {
        console.log('[StreamInfoFetcher] polling error')
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
