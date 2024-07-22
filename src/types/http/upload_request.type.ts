import type { Request } from 'express'

export interface UploadRequest extends Request {
  file_path?: string
  file_url?: string
}
