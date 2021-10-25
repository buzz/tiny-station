import { EventEmitter } from 'events'
import http from 'http'
import https from 'https'
import express from 'express'
import { parse as parseDate } from 'date-format-parse'

class StreamInfoHandler extends EventEmitter {
  icecastUrl = undefined

  router = undefined

  streamInfo = undefined

  clients = undefined

  constructor(icecastUrl) {
    super()
    this.icecastUrl = icecastUrl
    this.router = this.createRouter()
  }

  createRouter() {
    return express
      .Router()

      .post('/mount-add', (req, res) => {
        console.log('mount-add', req.body)

        try {
          this.clients = new Set()
          setTimeout(() => this.fetchInfo())
        } catch {
          // ignore
        }

        res.send()
      })

      .post('/mount-remove', (req, res) => {
        console.log('mount-remove', req.body)

        this.streamInfo = undefined
        this.clients = undefined

        res.send()
      })

      .post('/listener-add', (req, res) => {
        console.log('listener-add', req.body)

        try {
          if (req.body.action === 'listener_add') {
            this.clients.add(parseInt(req.body.client, 10))
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
        console.log('listener-remove', req.body)

        try {
          if (req.body.action === 'listener_remove') {
            this.clients.delete(parseInt(req.body.client, 10))
            this.emit('listeners', this.getListenerCount())
          }
        } catch {
          // ignore
        }

        res.send()
      })
  }

  fetchInfo() {
    new Promise((resolve) =>
      (this.icecastUrl.startsWith('https://') ? https : http).get(
        `${this.icecastUrl}status-json.xsl`,
        (res) => {
          let body = ''
          res.on('data', (chunk) => {
            body += chunk
          })
          res.on('end', () => resolve(JSON.parse(body)))
        }
      )
    )
      .then(({ icestats: { source } }) => {
        if (source) {
          const streamSource = Array.isArray(source) ? source[0] : source
          console.log(streamSource)
          this.streamInfo = {
            listenUrl: streamSource.listenurl,
            name: streamSource.server_name,
            streamStart: parseDate(source.stream_start, 'DD/MMM/YYYY:HH:mm:ss ZZ'),
          }
          this.emit('update', this.streamInfo)
        }
      })
      .catch((error) => {
        console.error('[StreamInfoFetcher] polling error')
        console.error(error)
        this.streamInfo = {}
        this.emit('update', this.streamInfo)
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
      return this.clients.size
    } catch {
      return 0
    }
  }
}

export default StreamInfoHandler
