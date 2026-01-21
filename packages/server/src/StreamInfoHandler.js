import { EventEmitter } from 'events'
import http from 'http'
import https from 'https'
import util from 'util'

import express from 'express'

const log = util.debuglog('listen-app:StreamInfoHandler')

const POLL_INTERVAL = 30 // seconds

const fetchStatus = (baseUrl) =>
  new Promise((resolve, reject) => {
    const httpLib = baseUrl.startsWith('https://') ? https : http
    const url = `${baseUrl}status-json.xsl`

    httpLib
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error('Failed to fetch status'))
        }

        let body = ''
        res.on('data', (chunk) => {
          body += chunk
        })
        res.on('end', () => {
          try {
            resolve(JSON.parse(body))
          } catch (err) {
            reject(err.message)
          }
        })
      })
      .on('error', (err) => {
        reject(err)
      })
  })

class StreamInfoHandler extends EventEmitter {
  icecastUrl = undefined

  router = undefined

  streamInfo = undefined

  streamPollTimeout = undefined

  constructor(icecastUrl) {
    super()
    this.icecastUrl = icecastUrl
    this.router = this.createRouter()
    this.fetchInfo()
  }

  createRouter() {
    return express
      .Router()

      .post('/mount-add', (req, res) => {
        log('mount-add', req.body)
        this.streamPollTimeout = setTimeout(() => this.fetchInfo())
        res.send()
      })

      .post('/mount-remove', (req, res) => {
        log('mount-remove', req.body)

        if (this.streamPollTimeout) {
          clearTimeout(this.streamPollTimeout)
        }
        this.streamInfo = undefined
        this.emit('update', this.streamInfo)

        res.send()
      })
  }

  fetchInfo() {
    const streamInfoOld = this.streamInfo

    fetchStatus(this.icecastUrl)
      .then(({ icestats: { source } }) => {
        if (source) {
          const streamSource = Array.isArray(source) ? source[0] : source
          log(streamSource)
          this.streamInfo = {
            listenUrl: streamSource.listenurl,
            name: streamSource.server_name,
            streamStart: new Date(source.stream_start_iso8601),
            listeners: source.listeners,
          }
        }
      })
      .catch((error) => {
        log('polling error')
        log(error)
        this.streamInfo = undefined
      })
      .finally(() => {
        if (
          streamInfoOld === undefined ||
          (this.streamInfo !== undefined &&
            streamInfoOld.listenUrl !== this.streamInfo.listenUrl &&
            streamInfoOld.name !== this.streamInfo.name &&
            streamInfoOld.streamStart !== this.streamInfo.streamStart)
        ) {
          this.emit('update', this.streamInfo)
        }

        if (this.streamInfo === undefined) {
          this.emit('listeners', 0)
        } else if (
          streamInfoOld === undefined ||
          streamInfoOld.listeners !== this.streamInfo.listeners
        ) {
          this.emit('listeners', this.streamInfo.listeners)
        }

        if (this.streamInfo !== undefined) {
          this.streamPollTimeout = setTimeout(() => this.fetchInfo(), POLL_INTERVAL * 1000)
        } else if (this.streamPollTimeout) {
          clearTimeout(this.streamPollTimeout)
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
