import createError from '@fastify/error'
import jwt from 'jsonwebtoken'
import type {
  FastifyRequest,
  FastifySchema,
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteGenericInterface,
} from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { jwtPayloadSchema } from './schemas.js'
import type { AuthenticatedReply, AuthenticatedRequest, UserData } from './types.js'

/** Type guard for `object`. */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function verifyJwt(token: string, jwtSecret: string): Promise<UserData> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        const payloadResult = jwtPayloadSchema.safeParse(decoded)
        if (payloadResult.error) {
          reject(payloadResult.error)
        } else {
          resolve(payloadResult.data.user)
        }
      }
    })
  })
}

const UnauthorizedError = createError('FST_UNAUTHORIZED', 'Unauthorized', 401)

function withUser<G extends RouteGenericInterface, S extends FastifySchema, R>(
  handler: (request: AuthenticatedRequest<G, S>, reply: AuthenticatedReply<G, S>) => R | Promise<R>
) {
  return (
    request: FastifyRequest<G, RawServerDefault, RawRequestDefaultExpression, S, ZodTypeProvider>,
    reply: AuthenticatedReply<G, S>
  ): R | Promise<R> => {
    const user = request.getDecorator<FastifyRequest['user']>('user')
    if (!user) {
      throw new UnauthorizedError('No user found')
    }

    return handler(request as AuthenticatedRequest<G, S>, reply)
  }
}

export { isObject, UnauthorizedError, verifyJwt, withUser }
