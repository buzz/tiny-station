import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

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

  const message = error.message || 'Internal Server Error'

  if (this.config.isDebug) {
    this.log.error(error)
  }

  return reply.status(statusCode).send({ error: message })
}

export default errorHandler
