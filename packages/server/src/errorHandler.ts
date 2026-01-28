import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { UnauthorizedError } from '#utils.js'

function errorHandler(
  this: FastifyInstance,
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
) {
  let statusCode = 500

  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      error: 'Validation error',
      issues: error.validation,
    })
  }

  if (error.statusCode) {
    statusCode = error.statusCode
  } else {
    switch (error.code) {
      case 'ENOTFOUND': {
        statusCode = 530
        break
      }
      case 'ETIMEDOUT': {
        statusCode = 504
        break
      }
    }
  }

  if (!(error instanceof UnauthorizedError)) {
    this.log.error(error)
  }

  return reply.status(statusCode).send({ error: error.message || 'Internal Server Error' })
}

export default errorHandler
