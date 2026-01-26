import { EventEmitter } from 'node:events'
import http from 'node:http'
import https from 'node:https'
import { debuglog } from 'node:util'

import express from 'express'

import type { StreamInfo } from '@listen-app/common'

import { POLL_INTERVAL } from './constants.js'
import { isObject } from './utils.js'

const log = debuglog('listen-app:StreamInfoHandler')

function fetchStatus(baseUrl: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const httpLib = baseUrl.startsWith('https://') ? https : http
    const url = `${baseUrl}admin/publicstats.json`

    httpLib
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error('Failed to fetch status'))
        }

        let body = ''
        res.on('data', (chunk: string) => {
          body += chunk
        })
        res.on('end', () => {
          try {
            resolve(JSON.parse(body))
          } catch (error) {
            if (error instanceof Error) {
              reject(error)
            } else {
              reject(new Error('Unknown error'))
            }
          }
        })
      })
      .on('error', (err) => {
        reject(err)
      })
  })
}

class StreamInfoHandler extends EventEmitter {
  private icecastUrl: string
  private router: express.Router
  private streamInfo: StreamInfo | null = null
  private streamPollTimeout: NodeJS.Timeout | null = null

  constructor(icecastUrl: string) {
    super()
    this.icecastUrl = icecastUrl
    this.router = this.createRouter()
    this.fetchInfo()
  }

  private createRouter(): express.Router {
    return express
      .Router()

      .post('/source-connect', (req, res) => {
        log('source-connect', req.body)
        this.streamPollTimeout = setTimeout(() => {
          this.fetchInfo()
        })
        res.send()
      })

      .post('/source-disconnect', (req, res) => {
        log('source-disconnect', req.body)

        if (this.streamPollTimeout) {
          clearTimeout(this.streamPollTimeout)
          this.streamPollTimeout = null
        }
        this.streamInfo = null
        this.emit('update', this.streamInfo)

        res.send()
      })
  }

  private fetchInfo() {
    const streamInfoOld = this.streamInfo

    fetchStatus(this.icecastUrl)
      .then((resp) => {
        if (Array.isArray(resp) && resp.length >= 2 && isObject(resp[1])) {
          const stats = resp[1]
          if (isObject(stats.source)) {
            const sources = Object.entries(stats.source)
            if (sources.length > 0) {
              const stats = sources[0][1]
              if (isObject(stats)) {
                const { listenurl, server_name, stream_start_iso8601, listeners } = stats
                if (
                  typeof listenurl === 'string' &&
                  typeof server_name === 'string' &&
                  typeof stream_start_iso8601 === 'string' &&
                  typeof listeners === 'number'
                ) {
                  this.streamInfo = {
                    listenUrl: listenurl,
                    name: server_name,
                    streamStart: new Date(stream_start_iso8601),
                    listeners,
                  }
                }
              }
            }
          }
        }
      })
      .catch((error: unknown) => {
        const typedError = error instanceof Error ? error : new Error('Unknown error')
        log('polling error')
        log(String(typedError))
        this.streamInfo = null
      })
      .finally(() => {
        if (
          streamInfoOld === null ||
          (this.streamInfo !== null &&
            streamInfoOld.listenUrl !== this.streamInfo.listenUrl &&
            streamInfoOld.name !== this.streamInfo.name &&
            streamInfoOld.streamStart !== this.streamInfo.streamStart)
        ) {
          this.emit('update', this.streamInfo)
        }

        if (this.streamInfo === null) {
          this.emit('listeners', 0)
        } else if (streamInfoOld?.listeners !== this.streamInfo.listeners) {
          this.emit('listeners', this.streamInfo.listeners)
        }

        if (this.streamInfo !== null) {
          this.streamPollTimeout = setTimeout(() => {
            this.fetchInfo()
          }, POLL_INTERVAL * 1000)
        } else if (this.streamPollTimeout) {
          clearTimeout(this.streamPollTimeout)
          this.streamPollTimeout = null
        }
      })
  }

  getRouter() {
    return this.router
  }

  getStreamInfo() {
    return this.streamInfo
  }
}

export default StreamInfoHandler
