import type { UserRequest } from '@type/http/user_request.type'
import type { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '@app/prisma'
import { FormattedResponseError } from '@utils/error/formatted_response_error.util'

/**
 * Middleware to check if the user is authenticated
 *
 * @param {UserRequest} req - Request object
 * @param {Response} _res - Response object
 * @param {NextFunction} next - Next function
 */
export const authMiddleware = async (
  req: UserRequest,
  _res: Response,
  next: NextFunction
) => {
  const bearerToken = req.get('Authorization')
  const errorMessage = 'Oops, your not authorized to access this resource'

  if (!bearerToken) throw new FormattedResponseError(401, errorMessage)

  const [bearer, token] = bearerToken.split(' ')

  if (bearer !== 'Bearer' || !token)
    throw new FormattedResponseError(401, errorMessage)

  const decoded = jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET as string
  ) as { id: string }
  req.user_id = decoded.id

  const isValidToken = await prisma.userToken.findFirst({
    where: { user_id: req.user_id, token },
    select: { id: true }
  })

  if (!isValidToken) throw new FormattedResponseError(401, errorMessage)

  next()
}
