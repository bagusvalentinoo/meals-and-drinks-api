import type { UserRequest } from '@type/http/user_request.type'
import type { UploadRequest } from '@type/http/upload_request.type'

export interface UserUploadRequest extends UserRequest, UploadRequest {}
