import { z, ZodType } from 'zod'
import type {
  CreateOrUpdateCategoryRequest,
  DeleteBatchCategoriesRequest
} from '@type/model/category.type'

export class CategoryValidation {
  /**
   * Create or Update Category Validation
   *
   * @returns {ZodType<CreateOrUpdateCategoryRequest>} - ZodType object
   */
  static readonly CREATE_UPDATE: ZodType<CreateOrUpdateCategoryRequest> =
    z.object({
      name: z
        .string({
          required_error: "Oops, category name can't be empty"
        })
        .min(1, {
          message: "Oops, category name can't be empty"
        })
    })

  /**
   * Find Category Validation
   *
   * @returns {ZodType<string>} - ZodType object
   */
  static readonly FIND: ZodType<string> = z
    .string({
      required_error: "Oops, category ID can't be empty"
    })
    .min(1, {
      message: "Oops, category ID can't be empty"
    })

  /**
   * Delete Batch Category Validation
   *
   * @returns {ZodType<DeleteBatchCategoriesRequest>} - ZodType object
   */
  static readonly DELETE_BATCH: ZodType<DeleteBatchCategoriesRequest> =
    z.object({
      ids: z
        .array(
          z
            .string({
              required_error: "Oops, tag ID can't be empty"
            })
            .min(1, {
              message: "Oops, tag ID can't be empty"
            })
        )
        .min(1, {
          message: "Oops, tag ID can't be empty"
        })
    })
}
