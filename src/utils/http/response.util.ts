import type { Response } from 'express'
import type { ApiResponse } from '@type/http/response.type'
import type { Pagination } from '@type/model/page.type'

/**
 * Function to send response
 *
 * @param {Response} res - Response object
 * @param {number} status_code - Status code
 * @param {string} message - Message
 * @param {T} data - Data
 * @param {string} param - Parameter
 */
export const responseSuccess = <T>(
  res: Response,
  status_code: number,
  message: string,
  data?: T,
  param?: string
) => {
  const response: ApiResponse = { success: true, status_code, message }

  if (data) response.data = param ? { [param]: data } : data

  return res.status(status_code).json(response)
}

/**
 * Function to send error response
 *
 * @param {Response} res - Response object
 * @param {number} status_code - Status code
 * @param {T} errors - Errors
 */
export const responseError = <T>(
  res: Response,
  status_code: number,
  errors: T
) => {
  const response: ApiResponse = { success: false, status_code, errors }

  return res.status(status_code).json(response)
}

/**
 * Function to paginate
 *
 * @param {number} total_items - Total items
 * @param {number} page - Page
 * @param {number} size - Size
 * @returns {Pagination} - Pagination
 */
export const paginate = (
  total_items: number,
  page: number,
  size: number
): Pagination => {
  const total_pages = Math.ceil(total_items / size)
  const next_page = page < total_pages ? page + 1 : null
  const prev_page = page > 1 ? page - 1 : null

  return {
    total_items,
    total_pages,
    current_page: page,
    next_page,
    prev_page,
    size
  }
}
