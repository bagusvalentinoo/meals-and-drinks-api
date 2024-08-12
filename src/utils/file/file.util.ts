import fs from 'fs'
import { validateMIMEType } from 'validate-image-type'
import { FormattedResponseError } from '@utils/error/formatted_response_error.util'

/**
 * Utility to delete a file
 *
 * @param {string} filePath - File path
 * @returns {void}
 */
export const deleteFile = (filePath: string): void => {
  fs.unlink(filePath, (err) => {
    if (err) console.info(`Failed to delete file: ${err}`)
  })
}

/**
 * Validate file type
 *
 * @param {string} filePath - File path
 * @param {string[]} allowMimeTypes - Allowed MIME types
 * @returns {Promise<void>}
 */
export const validateFile = async (
  filePath: string,
  allowMimeTypes: string[]
): Promise<void> => {
  const result = await validateMIMEType(filePath, { allowMimeTypes })

  if (!result.ok)
    throw new FormattedResponseError(
      400,
      `Oops, invalid file type. Only ${allowMimeTypes.join(', ')} are allowed`
    )
}
