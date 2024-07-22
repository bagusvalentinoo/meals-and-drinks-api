import type { Request } from 'express'

export interface UserRequest extends Request {
  user_id?: string
}
