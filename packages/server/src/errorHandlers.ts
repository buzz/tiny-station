import { debuglog } from 'node:util'

import type Express from 'express'

const log = debuglog('listen-app:request')

const consoleLogger: Express.ErrorRequestHandler = (err, _req, _res, next) => {
  if (err instanceof Error) {
    log(err.stack ?? err.message)
  }
  next(err)
}

const errCodeMatcher: Express.ErrorRequestHandler = (err, _req, _res, next) => {
  const nodeErr = err as NodeJS.ErrnoException

  let statusCode: number | undefined

  switch (nodeErr.code) {
    case 'ENOTFOUND': {
      statusCode = 530
      break
    }
    case 'ETIMEDOUT': {
      statusCode = 504
      break
    }
  }

  if (statusCode) {
    const newError: HttpError = new Error(
      err instanceof Error ? err.message : 'Internal Server Error'
    )
    newError.statusCode = statusCode
    next(newError)
  } else {
    next(err)
  }
}

const statusCodeSetter: Express.ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err)
  } else {
    const httpErr = err as HttpError
    const statusCode = httpErr.statusCode ?? 500

    res.status(statusCode)
    res.json({ error: httpErr.message })
  }
}

const errorHandlers: Express.ErrorRequestHandler[] = [errCodeMatcher, statusCodeSetter]
if (process.env.NODE_ENV !== 'production') {
  errorHandlers.unshift(consoleLogger)
}

interface HttpError extends Error {
  statusCode?: number
}

export default errorHandlers
