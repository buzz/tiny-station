import express from 'express'
import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'

import {
  type LoginData,
  LoginSchema,
  type RegisterData,
  RegisterSchema,
  type UpdateNotificationsData,
  UpdateNotificationsSchema,
  type VerifyEmailData,
  VerifyEmailSchema,
} from '@listen-app/common'

import { validateRequestBody } from '#validationMiddleware.js'
import type AuthService from '#AuthService.js'
import type { Config } from '#config.js'

interface UserData {
  email: string
  nickname: string
}

interface JwtPayload {
  user: UserData
}

const router = express.Router()
router.use(express.json())

function createJwtMiddleware(jwtSecret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization token required' })
      return
    }

    const token = authHeader.slice(7)

    try {
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload
      if (typeof decoded === 'object' && 'user' in decoded) {
        const user = decoded.user
        ;(req as Request & { user: UserData }).user = user
        next()
        return
      }
      res.status(401).json({ error: 'Invalid token format' })
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' })
    }
  }
}

function createAuthRoutes(
  config: Config,
  authService: AuthService
): ReturnType<typeof express.Router> {
  const jwtMiddleware = createJwtMiddleware(config.jwtSecret)

  router.post('/register', validateRequestBody(RegisterSchema), async (req, res) => {
    const { nickname, email, password, passwordConfirm, notif } = req.body as RegisterData

    try {
      await authService.register(nickname, email, password, passwordConfirm, notif)
      res.status(201).json({
        message:
          "Check your inbox and click the link in the confirmation mail. It's valid for one hour.",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      res.status(400).json({ error: message })
    }
  })

  router.post('/login', validateRequestBody(LoginSchema), async (req, res) => {
    const { nickname, password } = req.body as LoginData

    try {
      const result = await authService.login(nickname, password)
      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      res.status(401).json({ error: message })
    }
  })

  router.post('/verify', validateRequestBody(VerifyEmailSchema), async (req, res) => {
    const { token } = req.body as VerifyEmailData

    try {
      const result = await authService.verifyEmail(token)
      if (result.success) {
        res.status(200).json({ message: 'Email verified successfully' })
      } else {
        res.status(400).json({ error: 'Invalid or expired verification token' })
      }
    } catch {
      res.status(400).json({ error: 'Invalid or expired verification token' })
    }
  })

  router.get('/verify-jwt', jwtMiddleware, (req, res) => {
    const user = (req as Request & { user: UserData }).user
    res.status(200).json({
      nickname: user.nickname,
      email: user.email,
      authenticated: true,
    })
  })

  router.delete('/user', jwtMiddleware, async (req, res) => {
    const user = (req as Request & { user: UserData }).user
    try {
      await authService.deleteUser(user.email)
      res.status(204).send()
    } catch {
      res.status(500).json({ error: 'Failed to delete account' })
    }
  })

  router.put(
    '/user/notifications',
    jwtMiddleware,
    validateRequestBody(UpdateNotificationsSchema),
    async (req, res) => {
      const user = (req as Request & { user: UserData }).user
      const { subscribed } = req.body as UpdateNotificationsData

      try {
        await authService.updateNotifications(user.email, subscribed)
        res.status(200).json({ message: 'Notification preferences updated', subscribed })
      } catch {
        res.status(500).json({ error: 'Failed to update notification preferences' })
      }
    }
  )

  return router
}

export default createAuthRoutes
