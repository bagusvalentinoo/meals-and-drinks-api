export type Token = {
  token: string
  expired_at: Date
}

export type TokenResponse = {
  access_token: Token
  refresh_token: Token
}
