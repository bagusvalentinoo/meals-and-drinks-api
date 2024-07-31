import { z, ZodType } from 'zod'
import type { PaginationRequest } from '@type/model/page.type'

export class PageValidation {
  /**
   * Pagination Validation
   *
   * @returns {ZodType<PaginationRequest>} - ZodType object
   */
  static readonly PAGINATION: ZodType<PaginationRequest> = z.object({
    page: z
      .number({
        message: 'Oops, page must be a number',
        required_error: "Oops, page can't be empty"
      })
      .int({
        message: 'Oops, page must be an integer'
      })
      .positive({
        message: 'Oops, page must be a positive number'
      }),
    size: z
      .number({
        message: 'Oops, size must be a number',
        required_error: "Oops, size can't be empty"
      })
      .int({
        message: 'Oops, size must be an integer'
      })
      .positive({
        message: 'Oops, size must be a positive number'
      }),
    order_by: z
      .string({
        message: 'Oops, order_by must be a string'
      })
      .optional(),
    order_dir: z
      .string({
        message: 'Oops, order_dir must be a string'
      })
      .optional(),
    search: z
      .string({
        message: 'Oops, search must be a string'
      })
      .optional()
  })
}
