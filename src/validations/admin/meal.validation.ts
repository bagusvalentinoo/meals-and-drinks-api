import { z, ZodType } from 'zod'
import type { GetMealsRequest, CreateMealRequest } from '@type/model/meal.type'

export class MealValidation {
  /**
   * Get all Meals Validation
   *
   * @returns {ZodType<GetMealsRequest>} - ZodType object
   */
  static readonly GET_ALL: ZodType<GetMealsRequest> = z.object({
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
      .optional(),
    status: z
      .enum(['AVAILABLE', 'OUT_OF_STOCK', 'HIDDEN'], {
        message: 'Oops, status must be AVAILABLE, OUT_OF_STOCK, or HIDDEN'
      })
      .optional()
  })

  /**
   * Create Meal Validation
   *
   * @returns {ZodType<CreateMealRequest>} - ZodType object
   */
  static readonly CREATE: ZodType<CreateMealRequest> = z.object({
    tag_ids: z
      .union([
        z.array(
          z.string({
            message: 'Oops, tag ID must be string'
          })
        ),
        z.string({
          message: 'Oops, tag ID must be string'
        })
      ])
      .optional(),
    tag_names: z
      .union([
        z.array(
          z.string({
            message: 'Oops, tag name must be string'
          })
        ),
        z.string({
          message: 'Oops, tag name must be string'
        })
      ])
      .optional(),
    category_ids: z
      .union([
        z.array(
          z.string({
            message: 'Oops, category ID must be string'
          })
        ),
        z.string({
          message: 'Oops, category ID must be string'
        })
      ])
      .optional(),
    name: z
      .string({
        required_error: "Oops, name can't be empty"
      })
      .min(1, {
        message: "Oops, name can't be empty"
      }),
    description: z
      .string({
        required_error: "Oops, description can't be empty"
      })
      .min(1, {
        message: "Oops, description can't be empty"
      }),
    price: z
      .number({
        required_error: "Oops, price can't be empty",
        message: 'Oops, price must be number'
      })
      .min(1, {
        message: "Oops, price can't be empty"
      })
      .positive({
        message: 'Oops, price must be positive'
      }),
    stock: z
      .number({
        message: 'Oops, stock must be number'
      })
      .nonnegative({
        message: 'Oops, stock must be non-negative'
      }),
    status: z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'HIDDEN'], {
      required_error: "Oops, status can't be empty",
      message: 'Oops, status must be AVAILABLE, OUT_OF_STOCK, or HIDDEN'
    })
  })

  /**
   * Find Meal by ID Validation
   *
   * @returns {ZodType<string>} - ZodType object
   */
  static readonly FIND_BY_ID: ZodType<string> = z
    .string({
      required_error: "Oops, meal ID can't be empty"
    })
    .min(1, {
      message: "Oops, meal ID can't be empty"
    })
}
