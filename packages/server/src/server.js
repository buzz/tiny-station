import express from 'express'
import http from 'http'

import './dotenvConfig'
import { CLIENT_DIST_DIR, DEFAULT_PORT } from './constants'
import errorHandlers from './errorHandlers'
import StreamInfoFetcher from './StreamInfoFetcher'
import SocketIOManager from './SocketIOManager'

const streamInfoFetcher = new StreamInfoFetcher(process.env.ICECAST_URL)

const app = express()
app.use(express.json()).use(express.static(CLIENT_DIST_DIR)).use(errorHandlers)
const server = http.createServer(app)
const socketIOManager = new SocketIOManager(server, streamInfoFetcher)

server.listen(DEFAULT_PORT, () => console.log(`Listening on port ${DEFAULT_PORT}`))
