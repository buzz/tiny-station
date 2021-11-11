import { EventEmitter } from 'events'
import http from 'http'
import https from 'https'
import util from 'util'

import express from 'express'
import { parse as parseDate } from 'date-format-parse'

const log = util.debuglog('listen-app:StreamInfoHandler')

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

  listenerCount = 0

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

        try {
          this.listenerCount = 0
          setTimeout(() => this.fetchInfo())
        } catch {
          // ignore
        }

        res.send()
      })

      .post('/mount-remove', (req, res) => {
        log('mount-remove', req.body)

        this.streamInfo = undefined
        this.listenerCount = 0
        this.emit('update', this.streamInfo)
        this.emit('listeners', this.getListenerCount())

        res.send()
      })

      .post('/listener-add', (req, res) => {
        log('listener-add', req.body)

        try {
          if (req.body.action === 'listener_add') {
            this.listenerCount += 1
            this.emit('listeners', this.getListenerCount())
          }
        } catch {
          // ignore
        }

        res
          .set('icecast-auth-user', 1) // Allow all listeners
          .send()
      })

      .post('/listener-remove', (req, res) => {
        log('listener-remove', req.body)

        try {
          if (req.body.action === 'listener_remove') {
            this.listenerCount -= 1
            this.emit('listeners', this.getListenerCount())
          }
        } catch {
          // ignore
        }

        res.send()
      })
  }

  fetchInfo() {
    fetchStatus(this.icecastUrl)
      .then(({ icestats: { source } }) => {
        if (source) {
          const streamSource = Array.isArray(source) ? source[0] : source
          log(streamSource)
          this.streamInfo = {
            listenUrl: StreamInfoHandler.rewriteListenUrl(streamSource.listenurl),
            name: streamSource.server_name,
            streamStart: parseDate(source.stream_start, 'DD/MMM/YYYY:HH:mm:ss ZZ'),
          }
          this.listenerCount = parseInt(source.listeners, 10)
        }
      })
      .catch((error) => {
        log('polling error')
        log(error)
        this.streamInfo = {}
        this.listenerCount = 0
      })
      .finally(() => {
        this.emit('update', this.streamInfo)
        this.emit('listeners', this.getListenerCount())
      })
  }

  getRouter() {
    return this.router
  }

  getStreamInfo() {
    return this.streamInfo
  }

  getListenerCount() {
    try {
      return this.listenerCount
    } catch {
      return 0
    }
  }

  static rewriteListenUrl(urlString) {
    return urlString.replace('http://', 'https://')
  }
}

export default StreamInfoHandler
