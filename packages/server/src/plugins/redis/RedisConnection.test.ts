import { Redis } from 'ioredis'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { mockConfig } from '#test-utils/mocks.js'
import { makeRedisConnection } from '#test-utils/utils.js'

import RedisConnection, {
  getNicknameKey,
  getPasswordResetKey,
  getTokenKey,
  getUserKey,
} from './RedisConnection.ts'

describe('RedisConnection key generation', () => {
  it('generates correct nickname key', () => {
    expect(getNicknameKey('testuser')).toBe('nickname:testuser')
    expect(getNicknameKey('another')).toBe('nickname:another')
  })

  it('generates correct user key', () => {
    expect(getUserKey('test@example.com')).toBe('user:test@example.com')
    expect(getUserKey('user@domain.org')).toBe('user:user@domain.org')
  })

  it('generates correct token key', () => {
    expect(getTokenKey('abc123')).toBe('token:abc123')
    expect(getTokenKey('xyz789')).toBe('token:xyz789')
  })

  it('generates correct password reset key', () => {
    expect(getPasswordResetKey('reset123')).toBe('pwdreset:reset123')
    expect(getPasswordResetKey('token')).toBe('pwdreset:token')
  })
})

describe('RedisConnection integration tests', () => {
  let redis: Redis
  let connection: RedisConnection

  beforeAll(() => {
    const setup = makeRedisConnection(mockConfig)
    redis = setup.redis
    connection = setup.connection
  })

  beforeEach(async () => {
    await redis.flushall() // ensure isolation
  })

  afterAll(async () => {
    await redis.quit()
  })

  it('stores and retrieves chat messages', async () => {
    const msg = {
      uuid: '123',
      timestamp: Date.now(),
      senderNickname: 'Alice',
      message: 'Hello World',
    }
    await connection.storeMessage(msg)
    const history = await connection.getLatestMessages(10)
    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject(msg)
  })

  it('handles user verification lifecycle', async () => {
    const email = 'dev@test.com'
    const token = 'verify-me'
    await connection.addUser(email, 'coder', 'password123', token)
    expect(await connection.isVerified(email)).toBe(false)
    const success = await connection.verifyUser(token)
    expect(success).toBe(true)
    expect(await connection.isVerified(email)).toBe(true)
  })

  it('reports nickname and email existence and retrieves email by nickname', async () => {
    const nickname = 'tester'
    const email = 'tester@example.com'
    expect(await connection.nicknameExists(nickname)).toBe(false)
    expect(await connection.emailExists(email)).toBe(false)
    const token = 'tok123'
    await connection.addUser(email, nickname, 'pwd123', token)
    expect(await connection.nicknameExists(nickname)).toBe(true)
    expect(await connection.emailExists(email)).toBe(true)
    expect(await connection.getEmail(nickname)).toBe(email)
  })

  it('retrieves user data with verification and subscription status', async () => {
    const email = 'user2@test.com'
    const nickname = 'user2'
    const token = 'token2'
    await connection.addUser(email, nickname, 'pwd', token)
    let user = await connection.findUser(email)
    expect(user).toMatchObject({ email, nickname, ver: false, notif: false })
    await connection.verifyUser(token)
    await connection.subscribe(email)
    user = await connection.findUser(email)
    expect(user).toMatchObject({ email, nickname, ver: true, notif: true })
  })

  it('verifies password correctly depending on verification status', async () => {
    const email = 'pwd@test.com'
    const nickname = 'pwduser'
    const token = 'pwdtoken'
    const password = 'Secret123!'
    await connection.addUser(email, nickname, password, token)
    // not verified yet
    expect(await connection.verifyPassword(email, password)).toBe(false)
    await connection.verifyUser(token)
    expect(await connection.verifyPassword(email, password)).toBe(true)
    expect(await connection.verifyPassword(email, 'wrong')).toBe(false)
  })

  it('manages password reset token lifecycle', async () => {
    const email = 'reset@test.com'
    const nickname = 'resetuser'
    const token = 'resettoken'
    const pwdToken = 'pwdreset123'
    await connection.addUser(email, nickname, 'pwd', token)
    await connection.verifyUser(token)
    await connection.setPasswordResetToken(email, pwdToken)
    expect(await connection.getPasswordResetEmail(pwdToken)).toBe(email)
    await connection.deletePasswordResetToken(pwdToken)
    expect(await connection.getPasswordResetEmail(pwdToken)).toBeNull()
  })

  it('updates user password respecting verification', async () => {
    const email = 'updatepwd@test.com'
    const nickname = 'updateuser'
    const token = 'updtoken'
    const oldPwd = 'oldPass'
    const newPwd = 'newPass123'
    await connection.addUser(email, nickname, oldPwd, token)
    await connection.verifyUser(token)
    await connection.updateUserPassword(email, newPwd)
    expect(await connection.verifyPassword(email, newPwd)).toBe(true)
    expect(await connection.verifyPassword(email, oldPwd)).toBe(false)
  })

  it('handles subscription list and email retrieval', async () => {
    const email1 = 'sub1@test.com'
    const email2 = 'sub2@test.com'
    await connection.addUser(email1, 'sub1', 'pwd', 't1')
    await connection.addUser(email2, 'sub2', 'pwd', 't2')
    await connection.verifyUser('t1')
    await connection.verifyUser('t2')
    await connection.subscribe(email1)
    await connection.subscribe(email2)
    await connection.unsubscribe(email2)
    const subs = await connection.getSubscribedEmails()
    expect(subs).toContain(email1)
    expect(subs).not.toContain(email2)
  })

  it('deletes user and cleans up related keys', async () => {
    const email = 'del@test.com'
    const nickname = 'deluser'
    const token = 'deltoken'
    await connection.addUser(email, nickname, 'pwd', token)
    await connection.verifyUser(token)
    await connection.subscribe(email)
    await connection.deleteUser(email)
    expect(await connection.emailExists(email)).toBe(false)
    expect(await connection.nicknameExists(nickname)).toBe(false)
    // token should be removed from Redis directly
    expect(await redis.get(`token:${token}`)).toBeNull()
  })
})

describe('RedisConnection token deletion', () => {
  let redis: Redis
  let connection: RedisConnection

  beforeAll(() => {
    const setup = makeRedisConnection(mockConfig)
    redis = setup.redis
    connection = setup.connection
  })

  afterAll(async () => {
    await redis.quit()
  })

  beforeEach(async () => {
    await redis.flushall()
  })

  it('deletes verification token from Redis', async () => {
    const token = 'verify-token-123'
    const email = 'verify@test.com'
    // First, add a user with a verification token
    await connection.addUser(email, 'verifyuser', 'password', token)
    // Verify the token exists
    expect(await redis.get(`token:${token}`)).toBe(email)
    // Now delete the token
    const deletedCount = await connection.deleteToken(token)
    expect(deletedCount).toBe(1)
    // Verify the token is gone
    expect(await redis.get(`token:${token}`)).toBeNull()
  })
})

describe('RedisConnection quit', () => {
  it('closes Redis connection and returns OK', async () => {
    const testRedis = new Redis('redis://localhost:6379')
    const testConnection = new RedisConnection(
      { ...mockConfig, redisUrl: 'redis://localhost:6379' },
      testRedis
    )
    const result = await testConnection.quit()
    expect(result).toBe('OK')
    // Verify connection is closed by checking if commands fail
    await expect(testRedis.ping()).rejects.toThrow()
  })
})

describe('RedisConnection getMessages', () => {
  let redis: Redis
  let connection: RedisConnection

  beforeAll(() => {
    const setup = makeRedisConnection(mockConfig)
    redis = setup.redis
    connection = setup.connection
  })

  afterAll(async () => {
    await redis.quit()
  })

  beforeEach(async () => {
    await redis.flushall()
  })

  it('retrieves all chat messages without pagination', async () => {
    const now = Date.now()
    const messages = [
      { uuid: 'msg1', timestamp: now - 3000, senderNickname: 'Alice', message: 'Message 1' },
      { uuid: 'msg2', timestamp: now - 2000, senderNickname: 'Bob', message: 'Message 2' },
      { uuid: 'msg3', timestamp: now - 1000, senderNickname: 'Charlie', message: 'Message 3' },
    ]
    for (const msg of messages) {
      await connection.storeMessage(msg)
    }
    const retrievedMessages = await connection.getMessages()
    expect(retrievedMessages).toHaveLength(3)
    // getMessages returns messages in reverse chronological order (newest first)
    expect(retrievedMessages.map((m) => m.uuid)).toEqual(['msg3', 'msg2', 'msg1'])
  })

  it('returns empty array when no messages exist', async () => {
    const messages = await connection.getMessages()
    expect(messages).toEqual([])
  })

  it('retrieves messages in reverse chronological order', async () => {
    const now = Date.now()
    const messages = [
      { uuid: 'first', timestamp: now - 1000, senderNickname: 'FirstUser', message: 'First' },
      { uuid: 'second', timestamp: now - 500, senderNickname: 'SecondUser', message: 'Second' },
      { uuid: 'third', timestamp: now, senderNickname: 'ThirdUser', message: 'Third' },
    ]
    for (const msg of messages) {
      await connection.storeMessage(msg)
    }
    const retrievedMessages = await connection.getMessages()
    // Messages are returned newest first due to pop() reversing the order
    expect(retrievedMessages[0].uuid).toBe('third')
    expect(retrievedMessages[1].uuid).toBe('second')
    expect(retrievedMessages[2].uuid).toBe('first')
  })
})

describe('RedisConnection getMessagesBefore', () => {
  let redis: Redis
  let connection: RedisConnection

  beforeAll(() => {
    const setup = makeRedisConnection(mockConfig)
    redis = setup.redis
    connection = setup.connection
  })

  afterAll(async () => {
    await redis.quit()
  })

  beforeEach(async () => {
    await redis.flushall()
  })

  it('retrieves messages older than timestamp with limit', async () => {
    const now = Date.now()
    const messages = [
      { uuid: 'old1', timestamp: now - 4000, senderNickname: 'OldUser', message: 'Old message 1' },
      { uuid: 'old2', timestamp: now - 3000, senderNickname: 'OldUser', message: 'Old message 2' },
      { uuid: 'old3', timestamp: now - 2000, senderNickname: 'OldUser', message: 'Old message 3' },
      { uuid: 'new1', timestamp: now - 1000, senderNickname: 'NewUser', message: 'New message 1' },
      { uuid: 'new2', timestamp: now, senderNickname: 'NewUser', message: 'New message 2' },
    ]
    for (const msg of messages) {
      await connection.storeMessage(msg)
    }
    // Get messages older than now - 1500 (i.e., old1, old2, old3)
    const timestamp = now - 1500
    const retrievedMessages = await connection.getMessagesBefore(timestamp, 10)
    expect(retrievedMessages).toHaveLength(3)
    // Messages are returned newest first (reverse chronological order)
    expect(retrievedMessages.map((m) => m.uuid)).toEqual(['old3', 'old2', 'old1'])
  })

  it('respects limit parameter', async () => {
    const now = Date.now()
    const messages = [
      { uuid: 'msg1', timestamp: now - 5000, senderNickname: 'User1', message: 'Message 1' },
      { uuid: 'msg2', timestamp: now - 4000, senderNickname: 'User2', message: 'Message 2' },
      { uuid: 'msg3', timestamp: now - 3000, senderNickname: 'User3', message: 'Message 3' },
      { uuid: 'msg4', timestamp: now - 2000, senderNickname: 'User4', message: 'Message 4' },
      { uuid: 'msg5', timestamp: now - 1000, senderNickname: 'User5', message: 'Message 5' },
    ]
    for (const msg of messages) {
      await connection.storeMessage(msg)
    }
    const retrievedMessages = await connection.getMessagesBefore(now, 2)
    expect(retrievedMessages).toHaveLength(2)
    // Messages are returned newest first, limited to 2 items
    expect(retrievedMessages.map((m) => m.uuid)).toEqual(['msg5', 'msg4'])
  })

  it('returns empty array when no messages exist before timestamp', async () => {
    const now = Date.now()
    const messages = [
      { uuid: 'msg1', timestamp: now - 1000, senderNickname: 'User', message: 'Message' },
    ]
    await connection.storeMessage(messages[0])
    // Try to get messages before a timestamp that is before all messages
    const retrievedMessages = await connection.getMessagesBefore(now - 5000, 10)
    expect(retrievedMessages).toEqual([])
  })
})
