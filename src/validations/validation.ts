import { ZodType } from 'zod'

export class Validation {
  /**
   * Validate data
   *
   * @param {ZodType} schema - Zod schema
   * @param {T} data - Data to validate
   * @returns {T} - Validated data
   */
  static validate<T>(schema: ZodType, data: T): T {
    return schema.parse(data)
  }
}
