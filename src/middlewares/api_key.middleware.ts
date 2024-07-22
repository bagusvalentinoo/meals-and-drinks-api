import type { Request, Response, NextFunction } from 'express'
import { prisma } from '@app/prisma'
import { FormattedResponseError } from '@utils/error/formatted_response_error.util'

/**
 * Middleware to check if the API key is valid
 *
 * @param {Request} req - Request object
 * @param {Response} _res - Response object
 * @param {NextFunction} next - Next function
 */
export const apiKeyMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const apiKey = req.get('x-api-key')

  if (!apiKey)
    throw new FormattedResponseError(
      401,
      'Oops, you need to provide an API key!'
    )

  const isApiKeyExist = await prisma.apiKey.findFirst({
    where: { key: apiKey, status: 'ACTIVE' },
    select: { id: true }
  })

  if (!isApiKeyExist)
    throw new FormattedResponseError(401, 'Oops, invalid API key!')

  next()
}
