import { EventEmitter } from 'node:events'

import type { FastifyBaseLogger } from 'fastify'

import type { StreamInfo } from '@tiny-station/common'

import { POLL_INTERVAL } from '#constants.js'
import { icecastStatusSchema } from '#schemas.js'

async function fetchStatus(baseUrl: string) {
  const url = `${baseUrl}admin/publicstats.json`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch status: ${response.statusText}`)
  }

  const json = await response.json()
  const [, stats] = icecastStatusSchema.parse(json)
  const { source } = stats
  if (source) {
    const keys = Object.keys(source)
    if (keys.length > 0) {
      const endpoint = keys[0]
      return source[endpoint]
    }
  }
  return null
}

class StreamInfoHandler extends EventEmitter<StreamInfoEvents> {
  private _streamInfo: StreamInfo | null = null
  private streamPollTimeout: NodeJS.Timeout | null = null

  constructor(
    private icecastUrl: string,
    private log: FastifyBaseLogger
  ) {
    super()
  }

  handleSourceConnect() {
    this.streamPollTimeout = setTimeout(() => {
      this.fetchInfo()
    }, 2000)
  }

  handleSourceDisconnect() {
    if (this.streamPollTimeout) {
      clearTimeout(this.streamPollTimeout)
      this.streamPollTimeout = null
    }
    this._streamInfo = null
    this.emit('update', this._streamInfo)
  }

  get streamInfo() {
    return this._streamInfo
  }

  fetchInfo() {
    const streamInfoOld = this._streamInfo

    fetchStatus(this.icecastUrl)
      .then((status) => {
        if (status) {
          this._streamInfo = {
            listenUrl: status.listenurl,
            name: status.server_name,
            streamStart: new Date(status.stream_start_iso8601),
            listeners: status.listeners,
          }
        }
      })
      .catch((error: unknown) => {
        this.log.error(error, 'Failed to poll stream info')
        this._streamInfo = null
      })
      .finally(() => {
        if (
          streamInfoOld === null ||
          (this._streamInfo !== null &&
            streamInfoOld.listenUrl !== this._streamInfo.listenUrl &&
            streamInfoOld.name !== this._streamInfo.name &&
            streamInfoOld.streamStart !== this._streamInfo.streamStart)
        ) {
          this.emit('update', this._streamInfo)
        }

        if (this._streamInfo === null) {
          this.emit('listeners', 0)
        } else if (streamInfoOld?.listeners !== this._streamInfo.listeners) {
          this.emit('listeners', this._streamInfo.listeners)
        }

        if (this._streamInfo !== null) {
          this.streamPollTimeout = setTimeout(() => {
            this.fetchInfo()
          }, POLL_INTERVAL * 1000)
        } else if (this.streamPollTimeout) {
          clearTimeout(this.streamPollTimeout)
          this.streamPollTimeout = null
        }
      })
  }
}

interface StreamInfoEvents {
  update: [StreamInfo | null]
  listeners: [number]
}

export default StreamInfoHandler
