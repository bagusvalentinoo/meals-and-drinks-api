import { z, ZodType } from 'zod'
import type {
  CreateTagRequest,
  UpdateTagRequest,
  DeleteBatchTagsRequest
} from '@type/model/tag.type'

export class TagValidation {
  /**
   * Create Tag Validation
   *
   * @returns {ZodType<CreateTagRequest>} - ZodType object
   */
  static readonly CREATE: ZodType<CreateTagRequest> = z.object({
    names: z.union([
      z.array(
        z
          .string({
            required_error: "Oops, tag name can't be empty"
          })
          .min(1, {
            message: "Oops, tag name can't be empty"
          })
      ),
      z
        .string({
          required_error: "Oops, tag name can't be empty"
        })
        .min(1, {
          message: "Oops, tag name can't be empty"
        })
    ])
  })

  /**
   * Find Tag Validation
   *
   * @returns {ZodType<string>} - ZodType object
   */
  static readonly FIND: ZodType<string> = z
    .string({
      required_error: "Oops, tag ID can't be empty"
    })
    .min(1, {
      message: "Oops, tag ID can't be empty"
    })

  /**
   * Update Tag Validation
   *
   * @returns {ZodType<UpdateTagRequest>} - ZodType object
   */
  static readonly UPDATE: ZodType<UpdateTagRequest> = z.object({
    name: z
      .string({
        required_error: "Oops, tag name can't be empty"
      })
      .min(1, {
        message: "Oops, tag name can't be empty"
      })
  })

  /**
   * Delete Tag Validation
   *
   * @returns {ZodType<DeleteBatchTagsRequest>} - ZodType object
   */
  static readonly DELETE_BATCH: ZodType<DeleteBatchTagsRequest> = z.object({
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
