import type { FastifyRequest, onRequestAsyncHookHandler } from 'fastify'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'

import {
  errorResponseSchema,
  loginBodySchema,
  loginResponseSchema,
  messageResponseSchema,
  registerBodySchema,
  updateNotificationsBodySchema,
  updateNotificationsResponseSchema,
  verifyEmailBodySchema,
  verifyJwtResponseSchema,
} from '@listen-app/common'

import { UnauthorizedError, verifyJwt, withUser } from '#utils.js'

import type AuthService from './AuthService.js'

function makeAuthHandler(jwtSecret: string): onRequestAsyncHookHandler {
  return async (request: FastifyRequest) => {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization token required')
    }

    const token = authHeader.slice(7)
    try {
      const user = await verifyJwt(token, jwtSecret)
      request.setDecorator('user', user)
    } catch {
      throw new UnauthorizedError('Invalid JWT')
    }
  }
}

const authRoutes: FastifyPluginCallbackZod<{ authService: AuthService }> = (
  fastify,
  { authService }
) => {
  fastify.decorateRequest('user', null)

  const authHandler = makeAuthHandler(fastify.config.jwtSecret)

  fastify.post(
    '/register',
    {
      schema: {
        body: registerBodySchema,
        response: {
          201: messageResponseSchema,
          400: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { nickname, email, password, notif } = request.body

      try {
        await authService.register(nickname, email, password, notif)
        const message =
          "Check your inbox and click the link in the confirmation mail. It's valid for one hour."
        await reply.status(201).send({ message })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed'
        await reply.status(400).send({ error: message })
      }
    }
  )

  fastify.route({
    method: 'POST',
    url: '/login',
    schema: {
      body: loginBodySchema,
      response: {
        200: loginResponseSchema,
        401: errorResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { nickname, password } = request.body

      try {
        const result = await authService.login(nickname, password)
        await reply.status(200).send(result)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed'
        await reply.status(401).send({ error: message })
      }
    },
  })

  fastify.post(
    '/verify',
    {
      schema: {
        body: verifyEmailBodySchema,
        response: {
          200: messageResponseSchema,
          400: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { token } = request.body

      try {
        if (await authService.verifyEmail(token)) {
          await reply.status(200).send({ message: 'Email verified successfully' })
        }
      } catch {
        // Empty
      }
      await reply.status(400).send({ error: 'Invalid or expired verification token' })
    }
  )

  fastify.get(
    '/verify-jwt',
    {
      onRequest: [authHandler],
      schema: {
        response: {
          200: verifyJwtResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    withUser(({ user }) => ({
      nickname: user.nickname,
      email: user.id,
    }))
  )

  fastify.delete(
    '/user',
    {
      onRequest: [authHandler],
      schema: {
        response: {
          204: messageResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    withUser(async ({ user }, reply) => {
      try {
        await authService.deleteUser(user.id)
        await reply.status(204)
        return { message: 'Successfully deleted account' }
      } catch {
        await reply.status(500).send({ error: 'Failed to delete account' })
      }
    })
  )

  fastify.put(
    '/user/notifications',
    {
      onRequest: [authHandler],
      schema: {
        body: updateNotificationsBodySchema,
        response: {
          200: updateNotificationsResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    withUser(async ({ body, user }, reply) => {
      const { subscribed } = body

      try {
        await authService.updateNotifications(user.id, subscribed)
        await reply.status(200).send({ message: 'Notification preferences updated', subscribed })
      } catch {
        await reply.status(500).send({ error: 'Failed to update notification preferences' })
      }
    })
  )
}

export default authRoutes
