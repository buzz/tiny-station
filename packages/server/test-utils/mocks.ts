import EventEmitter from 'node:events'

import { vi } from 'vitest'
import type { FastifyBaseLogger } from 'fastify'
import type { Mocked } from 'vitest'

import type { StreamInfo } from '@tiny-station/common'

import type { Config } from '#plugins/config.js'
import type Mailer from '#plugins/mailer/Mailer.js'
import type RedisConnection from '#plugins/redis/RedisConnection.js'
import type StreamInfoHandler from '#plugins/streamInfo/StreamInfoHandler.js'

const mockConfig = {
  jwtSecret: 'test-jwt-secret-key-for-testing',
  redisUrl: 'redis://localhost:6379',
  redisKeyPrefix: 'tiny-station',
  baseUrl: 'http://localhost:3000',
  isDebug: false,
  icecastUrl: '',
  notifyDelay: 0,
  smtpHost: '',
  smtpPort: 0,
  smtpSecure: false,
  smtpUser: null,
  smtpPassword: null,
  smtpSender: '',
  smtpIgnoreInvalidCert: false,
} satisfies Config

function createMockLogger() {
  const mock = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    fatal: vi.fn(),
    trace: vi.fn(),
    silent: vi.fn(),
    child: vi.fn(),
  }
  mock.child.mockReturnValue(mock)

  return mock as unknown as Mocked<FastifyBaseLogger>
}

function createMockRedis() {
  return {
    nicknameExists: vi.fn().mockResolvedValue(false),
    emailExists: vi.fn().mockResolvedValue(false),
    getEmail: vi.fn().mockResolvedValue('test@example.com'),
    findUser: vi.fn().mockResolvedValue({
      email: 'test@example.com',
      nickname: 'testuser',
      ver: true,
      notif: false,
    }),
    addUser: vi.fn().mockImplementation(() => Promise.resolve()),
    deleteUser: vi.fn().mockImplementation(() => Promise.resolve()),
    deleteToken: vi.fn().mockImplementation(() => Promise.resolve()),
    verifyUser: vi.fn().mockResolvedValue(true),
    verifyPassword: vi.fn().mockResolvedValue(true),
    setPasswordResetToken: vi.fn().mockImplementation(() => Promise.resolve()),
    getPasswordResetEmail: vi.fn().mockResolvedValue('test@example.com'),
    deletePasswordResetToken: vi.fn().mockImplementation(() => Promise.resolve()),
    updateUserPassword: vi.fn().mockImplementation(() => Promise.resolve()),
    isVerified: vi.fn().mockResolvedValue(true),
    subscribe: vi.fn().mockResolvedValue(1),
    unsubscribe: vi.fn().mockResolvedValue(1),
    isSubscribed: vi.fn().mockResolvedValue(false),
    getMessages: vi.fn().mockResolvedValue([]),
    getMessagesBefore: vi.fn().mockResolvedValue([]),
    getLatestMessages: vi.fn().mockResolvedValue([]),
    storeMessage: vi.fn().mockResolvedValue(1),
    quit: vi.fn().mockResolvedValue('OK'),
  } as unknown as Mocked<RedisConnection>
}

function createMockMailer() {
  return {
    send: vi.fn().mockImplementation(() => Promise.resolve()),
  } as unknown as Mocked<Mailer>
}

function createMockStreamInfoHandler() {
  const emitter = new EventEmitter()

  const mockProperties = {
    streamInfo: {
      listenUrl: 'http://example.com/stream',
      name: 'Dummy Stream',
      streamStart: new Date(2025, 10, 10, 14, 23),
      listeners: 12,
    } satisfies StreamInfo,
    updateInfo: vi.fn(),
    updateListeners: vi.fn(),
  }

  return Object.assign(emitter, mockProperties) as unknown as Mocked<StreamInfoHandler>
}

export {
  createMockLogger,
  createMockMailer,
  createMockRedis,
  createMockStreamInfoHandler,
  mockConfig,
}
