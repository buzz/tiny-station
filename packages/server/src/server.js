import express from 'express'
import http from 'http'

import './dotenvConfig'
import errorHandlers from './errorHandlers'
import StreamInfoFetcher from './StreamInfoFetcher'
import SocketIOManager from './SocketIOManager'

const PORT = 3001

const streamInfoFetcher = new StreamInfoFetcher(process.env.ICECAST_URL)

const app = express()
app.use(express.json()).use(errorHandlers)
const server = http.createServer(app)
const socketIOManager = new SocketIOManager(streamInfoFetcher)

socketIOManager.start(server)
server.listen(PORT, () => console.log(`Listening on port ${PORT}`))
