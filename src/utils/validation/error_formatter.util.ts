import { ZodIssue } from 'zod'
import { ZodErrorResponse } from '@type/validation/error.type'

/**
 * Function to format Zod error
 *
 * @param {ZodIssue[]} error - Zod issue
 * @returns {ZodErrorResponse[]} - Zod error response
 */
export const formatZodError = (error: ZodIssue[]): ZodErrorResponse[] => {
  return error.map((issue) => {
    return {
      field: issue.path.join('.'),
      message: issue.message
    }
  })
}
