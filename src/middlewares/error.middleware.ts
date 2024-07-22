import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { FormattedResponseError } from '@utils/error/formatted_response_error.util'
import { MulterError } from 'multer'
import { formatZodError } from '@utils/validation/error_formatter.util'
import { Prisma } from '@prisma/client'
import { responseError } from '@utils/http/response.util'

/**
 * Middleware to handle error
 *
 * @param {Error} error - Error object
 * @param {Request} _req - Request object
 * @param {Response} res - Response object
 * @param {NextFunction} _next - Next function
 */
export const errorMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof ZodError) {
    const formatError = formatZodError(error.issues)
    return responseError(res, 422, formatError)
  } else if (error instanceof FormattedResponseError) {
    return responseError(res, error.status_code, error.message)
  } else if (
    error.message === 'jwt expired' ||
    error.message === 'invalid signature' ||
    error.message === 'jwt malformed'
  ) {
    return responseError(
      res,
      401,
      'Oops, your not authorized to access this resource'
    )
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const modelName = error.meta!.modelName
    const target = error.meta!.target
    return responseError(
      res,
      400,
      `Oops, model '${modelName}' with attribute '${target}' you filled already exists`
    )
  } else if (error instanceof MulterError) {
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return responseError(res, 400, 'Oops, you can only upload 1 file')
    } else if (error.code === 'LIMIT_FILE_SIZE') {
      return responseError(
        res,
        400,
        'Oops, file size is too large. Max file size is 2MB'
      )
    } else {
      return responseError(
        res,
        500,
        'Oops, Internal Server Error. Please try again later'
      )
    }
  } else {
    return responseError(
      res,
      500,
      'Oops, Internal Server Error. Please try again later'
    )
  }
}
