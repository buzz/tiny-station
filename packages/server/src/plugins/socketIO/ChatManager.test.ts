import Fastify from 'fastify'
import SocketIOClient from 'socket.io-client'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Redis } from 'ioredis'
import type { Mocked } from 'vitest'

import type { ChatMessage, ClientSocket } from '@tiny-station/common'

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

describe('ChatManager', () => {
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

  it('should authenticate user via JWT and allow chatting', async () => {
    const token = createTestToken('bob', 'bob@test.com', mockConfig.jwtSecret)
    const clientSocket: ClientSocket = SocketIOClient(url, { auth: { token } })
    await new Promise<void>((resolve) => clientSocket.once('connect', resolve))

    const messagePromise = new Promise<ChatMessage>((resolve) => {
      clientSocket.once('chat:message', resolve)
    })

    clientSocket.emit('chat:message', 'Hello from Bob')

    const received = await messagePromise
    expect(received.senderNickname).toBe('bob')
    expect(received.message).toBe('Hello from Bob')
    expect(received.timestamp).toEqual(expect.any(Number))
    expect(received.uuid).toEqual(expect.any(String))

    clientSocket.disconnect()
  })

  it('should treat missing token as guest and kick on chat', async () => {
    const clientSocket: ClientSocket = SocketIOClient(url, { auth: {} })
    await new Promise<void>((resolve) => clientSocket.once('connect', resolve))

    const kickPromise = new Promise((resolve) => {
      clientSocket.once('user:kick', resolve)
    })

    clientSocket.emit('chat:message', 'I am a hacker')

    const kickMsg = await kickPromise
    expect(kickMsg).toContain('must be logged in')

    clientSocket.disconnect()
  })

  it('should trim long messages', async () => {
    const token = createTestToken('bob', 'bob@test.com', mockConfig.jwtSecret)
    const clientSocket: ClientSocket = SocketIOClient(url, { auth: { token } })
    await new Promise<void>((resolve) => clientSocket.once('connect', resolve))

    const messagePromise = new Promise<ChatMessage>((resolve) => {
      clientSocket.once('chat:message', resolve)
    })

    const longString = 'x'.repeat(550)
    clientSocket.emit('chat:message', longString)

    const received = await messagePromise
    expect(received.message.length).toBeLessThanOrEqual(512)
  })

  it.each(['', '   '])("should ignore empty messages ('%s')", async (message: string) => {
    const token = createTestToken('bob', 'bob@test.com', mockConfig.jwtSecret)
    const clientSocket: ClientSocket = SocketIOClient(url, { auth: { token } })
    await new Promise<void>((resolve) => clientSocket.once('connect', resolve))

    const emitSpy = vi.spyOn(app.io, 'to')
    const storeSpy = vi.spyOn(redisConnection, 'storeMessage')

    clientSocket.emit('chat:message', message)
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(emitSpy).not.toHaveBeenCalled()
    expect(storeSpy).not.toHaveBeenCalled()
  })
})
