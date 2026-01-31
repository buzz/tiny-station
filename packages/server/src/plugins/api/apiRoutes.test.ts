import Fastify from 'fastify'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Mocked } from 'vitest'

import type { ChatMessagesResponse, ErrorResponse, VerifyJwtResponse } from '@listen-app/common'

import {
  createMockLogger,
  createMockMailer,
  createMockRedis,
  mockConfig,
} from '#test-utils/mocks.js'
import { createTestToken } from '#test-utils/utils.js'
import type { FastifyInstance } from '#app.js'
import type RedisConnection from '#plugins/redis/RedisConnection.js'

import apiRoutes from './apiRoutes.js'
import AuthService from './AuthService.js'

async function createTestApp() {
  const mockRedis = createMockRedis()
  const mockMailer = createMockMailer()
  const mockLogger = createMockLogger()
  const authService = new AuthService(mockConfig, mockRedis, mockMailer, mockLogger)

  const app = Fastify()
    .setValidatorCompiler(validatorCompiler)
    .setSerializerCompiler(serializerCompiler)
    .decorate('config', mockConfig)
    .decorate('redis', mockRedis)
    .decorate('authService', authService)
    .register(apiRoutes, { authService, prefix: '/api' })

  await app.ready()

  return { authService, app, mockRedis, mockMailer }
}

describe('GET /api/auth/verify-jwt', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    const setup = await createTestApp()
    app = setup.app
  })

  afterEach(async () => {
    await app.close()
  })

  it('should return user info for authenticated request', async () => {
    const token = createTestToken('testuser', 'test@example.com', mockConfig.jwtSecret)

    const response = await supertest(app.server)
      .get('/api/auth/verify-jwt')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    const body = response.body as VerifyJwtResponse

    expect(body.email).toBe('test@example.com')
    expect(body.nickname).toBe('testuser')
  })

  it('should return 401 for missing authorization header', async () => {
    const response = await supertest(app.server).get('/api/auth/verify-jwt').expect(401)
    const body = response.body as ErrorResponse

    expect(body.error).toContain('Unauthorized')
  })

  it('should return 401 for invalid token', async () => {
    const response = await supertest(app.server)
      .get('/api/auth/verify-jwt')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401)
    const body = response.body as ErrorResponse

    expect(body.error).toContain('Unauthorized')
  })
})

describe('GET /api/chat/messages', () => {
  let app: FastifyInstance
  let mockRedis: Mocked<RedisConnection>

  beforeEach(async () => {
    const setup = await createTestApp()
    app = setup.app
    mockRedis = setup.mockRedis

    mockRedis.getLatestMessages.mockResolvedValueOnce([
      { uuid: '1', timestamp: 1000, senderNickname: 'user1', message: 'Hello' },
      { uuid: '2', timestamp: 2000, senderNickname: 'user2', message: 'World' },
    ])
  })

  afterEach(async () => {
    await app.close()
  })

  it('should return latest messages', async () => {
    const response = await supertest(app.server)
      .get('/api/chat/messages')
      .query({ limit: 10 })
      .expect(200)
    const body = response.body as ChatMessagesResponse

    expect(body.messages).toHaveLength(2)
    expect(body.messages[0].message).toBe('Hello')
    expect(body.pagination.hasMore).toBe(false)
  })

  it('should handle pagination with before parameter', async () => {
    mockRedis.getMessagesBefore.mockResolvedValueOnce([
      { uuid: '1', timestamp: 500, senderNickname: 'user1', message: 'Old message' },
    ])

    const response = await supertest(app.server)
      .get('/api/chat/messages')
      .query({ limit: 10, before: 1000 })
      .expect(200)
    const body = response.body as ChatMessagesResponse

    expect(body.messages).toHaveLength(1)
    expect(mockRedis.getMessagesBefore).toHaveBeenCalledWith(1000, 10)
  })

  it('should return 400 when limit is invalid', async () => {
    const response = await supertest(app.server)
      .get('/api/chat/messages')
      .query({ limit: -5 })
      .expect(400)
    const body = response.body as ErrorResponse

    expect(body.error).toEqual(expect.any(String))
  })
})
