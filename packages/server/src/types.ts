import type {
  ContextConfigDefault,
  FastifyReply,
  FastifyRequest,
  FastifySchema,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteGenericInterface,
} from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { z } from 'zod'

import type { userDataSchema } from './schemas.js'

type AuthenticatedRequest<
  G extends RouteGenericInterface = RouteGenericInterface,
  S extends FastifySchema = FastifySchema,
> = FastifyRequest<G, RawServerDefault, RawRequestDefaultExpression, S, ZodTypeProvider> & {
  user: UserData
}

type AuthenticatedReply<G extends RouteGenericInterface, S extends FastifySchema> = FastifyReply<
  G,
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  ContextConfigDefault,
  S,
  ZodTypeProvider
>

type UserData = z.infer<typeof userDataSchema>

export type { AuthenticatedReply, AuthenticatedRequest, UserData }
