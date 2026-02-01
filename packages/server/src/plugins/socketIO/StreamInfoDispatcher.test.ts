import Fastify from 'fastify'
import SocketIOClient from 'socket.io-client'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { Redis } from 'ioredis'
import type { Mocked } from 'vitest'

import type { ClientSocket, StreamInfo } from '@tiny-station/common'

import { createMockStreamInfoHandler, mockConfig } from '#test-utils/mocks.js'
import { createTestToken, makeRedisConnection } from '#test-utils/utils.js'
import type { FastifyInstance } from '#app.js'
import type RedisConnection from '#plugins/redis/RedisConnection.js'
import type StreamInfoHandler from '#plugins/streamInfo/StreamInfoHandler.js'

import socketIOPlugin from './socketIOPlugin.ts'

async function createTestApp(
  redisConnectionInstance: RedisConnection,
  streamInfoHandler: Mocked<StreamInfoHandler>
): Promise<FastifyInstance> {
  const app = Fastify()

  app.decorate('config', mockConfig)
  app.decorate('redis', redisConnectionInstance)
  app.decorate('streamInfoHandler', streamInfoHandler)

  await app.register(socketIOPlugin)

  await app.listen({ port: 0 })
  return app
}

describe('StreamInfoDispatcher', () => {
  let app: FastifyInstance
  let url: string
  let redis: Redis
  let redisConnection: RedisConnection
  let mockStreamInfoHandler: Mocked<StreamInfoHandler>

  beforeAll(async () => {
    const redisSetup = makeRedisConnection(mockConfig)
    redis = redisSetup.redis
    redisConnection = redisSetup.connection
    mockStreamInfoHandler = createMockStreamInfoHandler()

    app = await createTestApp(redisConnection, mockStreamInfoHandler)
    const address = app.server.address()
    if (!address || typeof address === 'string') {
      throw new Error('expected AddressInfo')
    }
    url = `http://localhost:${address.port}`
  })

  beforeEach(async () => {
    await redis.flushall()
  })

  afterAll(async () => {
    await app.close()
    await redisConnection.quit()
  })

  it('should send current stream info upon request', async () => {
    const token = createTestToken('bob', 'bob@test.com', mockConfig.jwtSecret)
    const clientSocket: ClientSocket = SocketIOClient(url, { auth: { token } })
    await new Promise<void>((resolve) => clientSocket.once('connect', resolve))

    const responsePromise = new Promise<StreamInfo | null>((resolve) => {
      clientSocket.once('stream:info', resolve)
    })

    clientSocket.emit('stream:request')

    const received = await responsePromise
    expect(received?.listenUrl).toEqual('http://example.com/stream')
    expect(received?.name).toEqual('Dummy Stream')
    expect(received?.streamStart).toEqual(expect.any(String))
    expect(received?.listeners).toEqual(12)
    clientSocket.disconnect()
  })

  it('should broadcast to all clients when info updates', async () => {
    const token1 = createTestToken('alice', 'alice@test.com', mockConfig.jwtSecret)
    const clientSocket1: ClientSocket = SocketIOClient(url, { auth: { token: token1 } })
    await new Promise<void>((resolve) => clientSocket1.once('connect', resolve))

    const token2 = createTestToken('bob', 'bob@test.com', mockConfig.jwtSecret)
    const clientSocket2: ClientSocket = SocketIOClient(url, { auth: { token: token2 } })
    await new Promise<void>((resolve) => clientSocket2.once('connect', resolve))

    const nextInfo = {
      listenUrl: 'http://test.com/stream',
      name: 'Foo Stream',
      streamStart: new Date(2026, 1, 1, 10, 2),
      listeners: 2,
    } satisfies StreamInfo

    const streamInfoPromise1 = new Promise<StreamInfo | null>((resolve) =>
      clientSocket1.once('stream:info', resolve)
    )
    const streamInfoPromise2 = new Promise<StreamInfo | null>((resolve) =>
      clientSocket2.once('stream:info', resolve)
    )

    mockStreamInfoHandler.emit('update', nextInfo)

    const [streamInfo1, streamInfo2] = await Promise.all([streamInfoPromise1, streamInfoPromise2])

    expect(streamInfo1?.listenUrl).toEqual('http://test.com/stream')
    expect(streamInfo1?.name).toEqual('Foo Stream')
    expect(streamInfo1?.streamStart).toEqual(expect.any(String))
    expect(streamInfo1?.listeners).toEqual(2)

    expect(streamInfo2?.listenUrl).toEqual('http://test.com/stream')
    expect(streamInfo2?.name).toEqual('Foo Stream')
    expect(streamInfo2?.streamStart).toEqual(expect.any(String))
    expect(streamInfo2?.listeners).toEqual(2)

    clientSocket1.disconnect()
    clientSocket2.disconnect()
  })

  it('should broadcast listener count updates', async () => {
    const token = createTestToken('bob', 'bob@test.com', mockConfig.jwtSecret)
    const clientSocket: ClientSocket = SocketIOClient(url, { auth: { token } })
    await new Promise<void>((resolve) => clientSocket.once('connect', resolve))

    const listenerPromise = new Promise<number>((resolve) => {
      clientSocket.once('stream:listeners', resolve)
    })

    mockStreamInfoHandler.emit('listeners', 42)

    const count = await listenerPromise
    expect(count).toBe(42)
    clientSocket.disconnect()
  })
})
