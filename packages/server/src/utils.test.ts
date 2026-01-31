import jwt from 'jsonwebtoken'
import { describe, expect, it } from 'vitest'

import { isObject, UnauthorizedError, verifyJwt } from './utils.js'

describe('JWT utilities', () => {
  const jwtSecret = 'test-secret-key'

  describe('verifyJwt', () => {
    it('should verify valid JWT and return user data', async () => {
      const token = jwt.sign({ user: { _id: 'test@example.com', nickname: 'testuser' } }, jwtSecret)

      const userData = await verifyJwt(token, jwtSecret)

      expect(userData._id).toBe('test@example.com')
      expect(userData.nickname).toBe('testuser')
    })

    it('should reject expired JWT', async () => {
      const token = jwt.sign(
        { user: { _id: 'test@example.com', nickname: 'testuser' } },
        jwtSecret,
        { expiresIn: '-1s' }
      )

      await expect(verifyJwt(token, jwtSecret)).rejects.toThrow()
    })

    it('should reject JWT with invalid signature', async () => {
      const token = jwt.sign(
        { user: { _id: 'test@example.com', nickname: 'testuser' } },
        'wrong-secret'
      )

      await expect(verifyJwt(token, jwtSecret)).rejects.toThrow()
    })

    it('should reject malformed JWT', async () => {
      await expect(verifyJwt('invalid-token', jwtSecret)).rejects.toThrow()
    })
  })

  describe('JWT sign and verify roundtrip', () => {
    it('should sign and verify correctly', async () => {
      const email = 'user@example.com'
      const nickname = 'testuser'

      const token = jwt.sign({ user: { _id: email, nickname } }, jwtSecret)
      const userData = await verifyJwt(token, jwtSecret)

      expect(userData._id).toBe(email)
      expect(userData.nickname).toBe(nickname)
    })
  })
})

describe('isObject', () => {
  it('should return true for plain objects', () => {
    expect(isObject({})).toBe(true)
    expect(isObject({ key: 'value' })).toBe(true)
    expect(isObject({ nested: { value: 1 } })).toBe(true)
  })

  it('should return false for null', () => {
    expect(isObject(null)).toBe(false)
  })

  it('should return false for arrays', () => {
    expect(isObject([])).toBe(false)
    expect(isObject([1, 2, 3])).toBe(false)
  })

  it('should return false for primitives', () => {
    expect(isObject('string')).toBe(false)
    expect(isObject(123)).toBe(false)
    expect(isObject(true)).toBe(false)
    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(isObject(undefined)).toBe(false)
  })
})

describe('UnauthorizedError', () => {
  it('should be an instance of Error', () => {
    const error = new UnauthorizedError('Test message')

    expect(error).toBeInstanceOf(Error)
  })

  it('should have correct name', () => {
    const error = new UnauthorizedError('Test message')

    expect(error.name).toBe('FastifyError')
  })

  it('should have correct message', () => {
    const error = new UnauthorizedError('Unauthorized access')

    expect(error.message).toBe('Unauthorized Unauthorized access')
  })

  it('should have correct status code', () => {
    const error = new UnauthorizedError('Test message')

    expect(error.statusCode).toBe(401)
  })

  it('should be throwable and catchable', () => {
    try {
      throw new UnauthorizedError('Access denied')
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedError)
      const unauthorizedError = error as InstanceType<typeof UnauthorizedError>
      expect(unauthorizedError.statusCode).toBe(401)
    }
  })
})
