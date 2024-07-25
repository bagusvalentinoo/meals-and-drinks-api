import type { Response, NextFunction } from 'express'
import type { UserRequest } from '@type/http/user_request.type'
import { prisma } from '@app/prisma'
import { FormattedResponseError } from '@utils/error/formatted_response_error.util'

/**
 * A middleware to check the user role
 *
 * @param {string} role - The role to check
 */
export const checkUserRole =
  (role: string) =>
  async (req: UserRequest, _res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user_id },
        include: {
          roles: {
            include: {
              role: { select: { name: true } }
            }
          }
        }
      })

      const errorMessage =
        'Oops, you are not authorized to access this resource'

      if (!user) return next(new FormattedResponseError(401, errorMessage))

      const roles = user.roles.map((role) => role.role.name)
      const hasRole = roles.some((r) => r === role)

      if (!hasRole) return next(new FormattedResponseError(401, errorMessage))

      next()
    } catch (error) {
      next(error)
    }
  }

export const adminMiddleware = checkUserRole('ADMIN')
export const userMiddleware = checkUserRole('USER')
