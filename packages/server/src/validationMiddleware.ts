import { z as zValue } from 'zod'
import type { NextFunction, Request, Response } from 'express'
import type { z } from 'zod'

export function validateRequestBody(
  schema: z.ZodType
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const formattedErrors = zValue.treeifyError(result.error)
      res.status(400).json(formattedErrors)
      return
    }

    req.body = result.data
    next()
  }
}
