import { describe, expect, it } from 'vitest'

import { loginBodySchema, registerBodySchema } from './apiSchemas.js'

describe('apiSchemas', () => {
  describe('loginBodySchema', () => {
    it('validates correct login data', () => {
      const validData = {
        nickname: 'testuser',
        password: 'password123',
      }

      const result = loginBodySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects empty nickname', () => {
      const invalidData = {
        nickname: '',
        password: 'password123',
      }

      const result = loginBodySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects empty password', () => {
      const invalidData = {
        nickname: 'testuser',
        password: '',
      }

      const result = loginBodySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('registerBodySchema', () => {
    it('validates correct registration data', () => {
      const validData = {
        nickname: 'testuser',
        email: 'user@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        notif: false,
      }

      const result = registerBodySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects invalid email format', () => {
      const invalidData = {
        nickname: 'testuser',
        email: 'not-an-email',
        password: 'password123',
        passwordConfirm: 'password123',
        notif: false,
      }

      const result = registerBodySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects short nickname', () => {
      const invalidData = {
        nickname: 'ab',
        email: 'user@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        notif: false,
      }

      const result = registerBodySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects short password', () => {
      const invalidData = {
        nickname: 'testuser',
        email: 'user@example.com',
        password: '123',
        passwordConfirm: '123',
        notif: false,
      }

      const result = registerBodySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects mismatched password confirmation', () => {
      const invalidData = {
        nickname: 'testuser',
        email: 'user@example.com',
        password: 'password123',
        passwordConfirm: 'differentpassword',
        notif: false,
      }

      const result = registerBodySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.path).toContain('passwordConfirm')
    })

    it('accepts valid data without optional notif field', () => {
      const validData = {
        nickname: 'testuser',
        email: 'user@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
      }

      const result = registerBodySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})
