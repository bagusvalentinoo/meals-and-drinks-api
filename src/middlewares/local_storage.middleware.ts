import type { Response, NextFunction } from 'express'
import type { UploadRequest } from '@type/http/upload_request.type'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import {
  getCurrentDateFormatted,
  generateRandomString
} from '@utils/string/string_formatter.util'

/**
 * A middleware to store files in the local storage
 *
 * @param {string} folderName - The folder name where the file will be stored
 * @param {string} fieldName - The field name of the file
 * @param {boolean} isMultiple - A boolean to determine if the file is multiple or not
 */
export const localStorageMiddleware =
  (folderName: string, fieldName: string, isMultiple: boolean = false) =>
  (req: UploadRequest, res: Response, next: NextFunction) => {
    const destination = path.join(__dirname, `../../public/${folderName}`)

    if (!fs.existsSync(destination))
      fs.mkdirSync(destination, { recursive: true })

    const storage = multer.diskStorage({
      destination: (_req, _file, callback) => {
        callback(null, destination)
      },
      filename: (req: UploadRequest, file, callback) => {
        const fileName = `${getCurrentDateFormatted()}_${generateRandomString(
          10
        )}_${path.extname(file.originalname)}`
        req.file_path = path.join(destination, fileName)
        req.file_url = `${process.env.APP_URL}/${folderName}/${fileName}`

        callback(null, fileName)
      }
    })

    const fileFilter = (
      _req: UploadRequest,
      file: Express.Multer.File,
      callback: multer.FileFilterCallback
    ) => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']

      if (!allowedTypes.includes(file.mimetype))
        return callback(
          new Error(
            'Oops, invalid file type. Only JPEG, JPG, and PNG are allowed'
          )
        )

      callback(null, true)
    }

    const limits = {
      fileSize: 2 * 1024 * 1024 // 2MB
    }

    const upload = isMultiple
      ? multer({ storage, fileFilter, limits }).array(fieldName, 10)
      : multer({ storage, fileFilter, limits }).single(fieldName)

    upload(req, res, (err) => {
      if (err) next(err)

      next()
    })
  }
