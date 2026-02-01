import type { FastifyRequest, onRequestAsyncHookHandler } from 'fastify'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'

import {
  chatMessagesQuerySchema,
  chatMessagesResponseSchema,
  errorResponseSchema,
  forgotPasswordBodySchema,
  loginBodySchema,
  loginResponseSchema,
  messageResponseSchema,
  registerBodySchema,
  resetPasswordBodySchema,
  updateNotificationsBodySchema,
  updateNotificationsResponseSchema,
  verifyEmailBodySchema,
  verifyJwtResponseSchema,
} from '@tiny-station/common'

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

const apiRoutes: FastifyPluginCallbackZod<{ authService: AuthService }> = (
  fastify,
  { authService }
) => {
  fastify.decorateRequest('user', null)

  const authHandler = makeAuthHandler(fastify.config.jwtSecret)

  fastify.post(
    '/auth/register',
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
    url: '/auth/login',
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
    '/auth/verify',
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
    '/auth/verify-jwt',
    {
      onRequest: [authHandler],
      schema: {
        response: {
          200: verifyJwtResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    withUser(async ({ user }) => {
      const subscribed = await fastify.redis.isSubscribed(user._id)
      return {
        email: user._id,
        nickname: user.nickname,
        subscribed,
      }
    })
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
        await authService.deleteUser(user._id)
        await reply.status(204).send({ message: 'Successfully deleted account' })
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
        await authService.updateNotifications(user._id, subscribed)
        await reply.status(200).send({ message: 'Notification preferences updated', subscribed })
      } catch {
        await reply.status(500).send({ error: 'Failed to update notification preferences' })
      }
    })
  )

  fastify.post(
    '/auth/forgot-password',
    {
      schema: {
        body: forgotPasswordBodySchema,
        response: {
          200: messageResponseSchema,
          400: errorResponseSchema,
          429: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body

      try {
        await authService.requestPasswordReset(email)
        const message =
          'If an account with that email exists, a password reset link has been sent. Check your inbox.'
        await reply.status(200).send({ message })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to process request'
        await reply.status(400).send({ error: message })
      }
    }
  )

  fastify.post(
    '/auth/reset-password',
    {
      schema: {
        body: resetPasswordBodySchema,
        response: {
          200: messageResponseSchema,
          400: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { token, password } = request.body

      try {
        await authService.resetPassword(token, password)
        await reply.status(200).send({ message: 'Password has been reset successfully' })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to reset password'
        await reply.status(400).send({ error: message })
      }
    }
  )

  fastify.get(
    '/chat/messages',
    {
      schema: {
        querystring: chatMessagesQuerySchema,
        response: {
          200: chatMessagesResponseSchema,
          400: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { limit, before } = request.query

      try {
        const messages = await (before === undefined
          ? fastify.redis.getLatestMessages(limit)
          : fastify.redis.getMessagesBefore(before, limit))

        const hasMore = messages.length === limit
        const earliestMessage = messages.at(-1)
        const earliestTimestamp = earliestMessage === undefined ? null : earliestMessage.timestamp

        await reply.status(200).send({ messages, pagination: { hasMore, earliestTimestamp } })
      } catch {
        await reply.status(400).send({ error: 'Failed to fetch messages' })
      }
    }
  )
}

export default apiRoutes
