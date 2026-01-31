import { beforeEach, describe, expect, it, type Mocked, vi } from 'vitest'

import {
  createMockLogger,
  createMockMailer,
  createMockRedis,
  mockConfig,
} from '#test-utils/mocks.js'
import type Mailer from '#plugins/mailer/Mailer.js'
import type RedisConnection from '#plugins/redis/RedisConnection.js'

import AuthService from './AuthService.js'

describe('AuthService', () => {
  let authService: AuthService
  let mockRedis: Mocked<RedisConnection>
  let mockMailer: Mocked<Mailer>
  const mockLogger = createMockLogger()

  beforeEach(() => {
    vi.resetAllMocks()
    mockRedis = createMockRedis()
    mockMailer = createMockMailer()
    authService = new AuthService(mockConfig, mockRedis, mockMailer, mockLogger)
  })

  describe('register', () => {
    it('should throw error if nickname already exists', async () => {
      mockRedis.nicknameExists.mockResolvedValueOnce(true)

      await expect(
        authService.register('existinguser', 'new@example.com', 'password123', false)
      ).rejects.toThrow('nickname is not available')

      expect(mockRedis.nicknameExists).toHaveBeenCalledWith('existinguser')
    })

    it('should throw error if email already exists', async () => {
      mockRedis.emailExists.mockResolvedValueOnce(true)

      await expect(
        authService.register('newuser', 'existing@example.com', 'password123', false)
      ).rejects.toThrow('email is not available')

      expect(mockRedis.emailExists).toHaveBeenCalledWith('existing@example.com')
    })

    it('should register user and send confirmation email', async () => {
      await authService.register('newuser', 'new@example.com', 'password123', true)

      expect(mockRedis.addUser).toHaveBeenCalled()
      expect(mockRedis.subscribe).toHaveBeenCalledWith('new@example.com')
      expect(mockMailer.send).toHaveBeenCalled()
    })

    it('should not subscribe when notif is false', async () => {
      await authService.register('newuser', 'new@example.com', 'password123', false)

      expect(mockRedis.subscribe).not.toHaveBeenCalled()
    })

    it('should clean nickname and rollback on mail failure', async () => {
      mockMailer.send.mockRejectedValueOnce(new Error('Mail failed'))

      await expect(
        authService.register('newuser', 'new@example.com', 'password123', false)
      ).rejects.toThrow('Failed to send confirmation mail')

      expect(mockRedis.deleteUser).toHaveBeenCalledWith('new@example.com')
      expect(mockRedis.unsubscribe).toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('should return token and user info for valid credentials', async () => {
      mockRedis.verifyPassword.mockResolvedValueOnce(true)

      const result = await authService.login('testuser', 'password123')

      expect(result.token).toBeDefined()
      expect(result.nickname).toBe('testuser')
      expect(result.subscribed).toBe(false)
    })

    it('should throw error for wrong password', async () => {
      mockRedis.verifyPassword.mockResolvedValueOnce(false)

      await expect(authService.login('testuser', 'wrongpassword')).rejects.toThrow(
        'Wrong nickname or password'
      )
    })

    it('should throw error for non-existent user', async () => {
      mockRedis.getEmail.mockImplementationOnce(() => Promise.resolve(null))

      await expect(authService.login('nonexistent', 'password123')).rejects.toThrow(
        'Wrong nickname or password'
      )
    })
  })

  describe('verifyEmail', () => {
    it('should return true for valid token', async () => {
      mockRedis.verifyUser.mockResolvedValueOnce(true)

      const result = await authService.verifyEmail('validToken')

      expect(result).toBe(true)
      expect(mockRedis.verifyUser).toHaveBeenCalledWith('validToken')
    })

    it('should return false for invalid token', async () => {
      mockRedis.verifyUser.mockResolvedValueOnce(false)

      const result = await authService.verifyEmail('invalidToken')

      expect(result).toBe(false)
    })
  })

  describe('deleteUser', () => {
    it('should delete user and unsubscribe', async () => {
      await authService.deleteUser('test@example.com')

      expect(mockRedis.deleteUser).toHaveBeenCalledWith('test@example.com')
      expect(mockRedis.unsubscribe).toHaveBeenCalledWith('test@example.com')
    })
  })

  describe('updateNotifications', () => {
    it('should subscribe when subscribed is true', async () => {
      await authService.updateNotifications('test@example.com', true)

      expect(mockRedis.subscribe).toHaveBeenCalledWith('test@example.com')
      expect(mockRedis.unsubscribe).not.toHaveBeenCalled()
    })

    it('should unsubscribe when subscribed is false', async () => {
      await authService.updateNotifications('test@example.com', false)

      expect(mockRedis.unsubscribe).toHaveBeenCalledWith('test@example.com')
      expect(mockRedis.subscribe).not.toHaveBeenCalled()
    })
  })

  describe('requestPasswordReset', () => {
    it('should send reset email for verified user', async () => {
      mockRedis.findUser.mockResolvedValueOnce({
        email: 'test@example.com',
        nickname: 'testuser',
        ver: true,
        notif: false,
      })

      await authService.requestPasswordReset('test@example.com')

      expect(mockRedis.setPasswordResetToken).toHaveBeenCalled()
      expect(mockMailer.send).toHaveBeenCalled()
    })

    it('should not send email for unverified user', async () => {
      mockRedis.findUser.mockResolvedValueOnce({
        email: 'test@example.com',
        nickname: 'testuser',
        ver: false,
        notif: false,
      })

      await authService.requestPasswordReset('test@example.com')

      expect(mockMailer.send).not.toHaveBeenCalled()
    })

    it('should not send email for non-existent user', async () => {
      mockRedis.findUser.mockResolvedValueOnce(null)

      await authService.requestPasswordReset('nonexistent@example.com')

      expect(mockMailer.send).not.toHaveBeenCalled()
    })
  })

  describe('resetPassword', () => {
    it('should update password with valid token', async () => {
      mockRedis.getPasswordResetEmail.mockResolvedValueOnce('test@example.com')

      await authService.resetPassword('validToken', 'newpassword123')

      expect(mockRedis.updateUserPassword).toHaveBeenCalledWith(
        'test@example.com',
        'newpassword123'
      )
      expect(mockRedis.deletePasswordResetToken).toHaveBeenCalledWith('validToken')
    })

    it('should throw error for invalid token', async () => {
      mockRedis.getPasswordResetEmail.mockResolvedValueOnce(null)

      await expect(authService.resetPassword('invalidToken', 'newpassword123')).rejects.toThrow(
        'Invalid or expired reset token'
      )
    })
  })
})
