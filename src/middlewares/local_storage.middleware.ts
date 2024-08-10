import type { Response, NextFunction } from 'express'
import type { UploadRequest } from '@type/http/upload_request.type'
import multer, { MulterError } from 'multer'
import path from 'path'
import fs from 'fs'
import {
  getCurrentDateFormatted,
  generateRandomString
} from '@utils/string/string_formatter.util'
import { deleteFile } from '@utils/file/file.util'
import { FormattedResponseError } from '@utils/error/formatted_response_error.util'

/**
 * A middleware to store files in the local storage
 *
 * @param {string} folderName - The folder name where the file will be stored
 * @param {string} fieldName - The field name of the file
 * @param {number} maxSize - The maximum size of the file in megabytes (MB)
 * @param {boolean} isMultiple - A boolean to determine if the file is multiple or not
 */
export const localStorageMiddleware =
  (
    folderName: string,
    fieldName: string,
    maxSize: number = 1,
    isMultiple: boolean = false
  ) =>
  (req: UploadRequest, res: Response, next: NextFunction) => {
    const destination = path.join(__dirname, `../../public/${folderName}`)

    if (!fs.existsSync(destination))
      fs.mkdirSync(destination, { recursive: true })

    const storage = multer.diskStorage({
      destination: (_req, _file, callback) => {
        callback(null, destination)
      },
      filename: (req: UploadRequest, file, callback) => {
        const fileName = `${generateRandomString(30)}_${getCurrentDateFormatted()}_${path.extname(file.originalname)}`
        req.file_path = path.join(destination, fileName)
        req.file_url = `${process.env.APP_URL as string}/${folderName}/${fileName}`

        callback(null, fileName)
      }
    })

    const limits = { fileSize: maxSize * 1024 * 1024 }

    const upload = isMultiple
      ? multer({ storage, limits }).array(fieldName, 10)
      : multer({ storage, limits }).single(fieldName)

    upload(req, res, (err) => {
      if (err) {
        if (err instanceof MulterError && err.code === 'LIMIT_FILE_SIZE')
          next(
            new FormattedResponseError(
              400,
              `Oops, file size is too large. Maximum file size is ${maxSize}MB`
            )
          )

        if (req.file_path) deleteFile(req.file_path)
        next(err)
      }
      next()
    })
  }
