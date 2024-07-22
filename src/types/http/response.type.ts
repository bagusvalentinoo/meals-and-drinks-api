type ApiSuccessResponse = {
  success: true
  message: string
  data?: object
}

type ApiErrorResponse = {
  success: false
  errors: any
}

export type ApiResponse = {
  status_code: number
} & (ApiSuccessResponse | ApiErrorResponse)
