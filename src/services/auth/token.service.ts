import { prisma } from '@app/prisma'
import jwt from 'jsonwebtoken'
import { getExpiryTokenDateTime } from '@utils/date/date_formatter.util'
import { UserRefreshTokenRequest } from '@type/model/user.type'
import type { Token, TokenResponse } from '@type/model/token.type'
import { Validation } from '@validations/validation'
import { AuthValidation } from '@validations/auth/auth.validation'
import { FormattedResponseError } from '@utils/error/formatted_response_error.util'

export class TokenService {
  /**
   * Generate a JWT token
   *
   * @param {'ACCESS' | 'REFRESH'} type - Type of token to generate {'ACCESS' | 'REFRESH'}
   * @param {string} userId - User ID
   * @returns {Token} Token
   */
  static generateToken(type: 'ACCESS' | 'REFRESH', userId: string): Token {
    const secret =
      type === 'ACCESS'
        ? (process.env.JWT_ACCESS_SECRET as string)
        : (process.env.JWT_REFRESH_SECRET as string)
    const expiresIn =
      type === 'ACCESS'
        ? (process.env.JWT_ACCESS_EXPIRY as string)
        : (process.env.JWT_REFRESH_EXPIRY as string)

    const token = jwt.sign({ id: userId }, secret, { expiresIn })
    const tokenExpiry = getExpiryTokenDateTime(token)

    return { token, expired_at: tokenExpiry }
  }

  /**
   * Insert Access and Refresh token to the database
   *
   * @param {string} userId - User ID
   * @param {Token} accessToken - Access token
   * @param {Token} refreshToken - Refresh token
   */
  static async insertToken(
    userId: string,
    accessToken: Token,
    refreshToken: Token
  ) {
    return prisma.$transaction([
      prisma.userToken.createMany({
        data: [
          {
            user_id: userId,
            type: 'ACCESS',
            token: accessToken.token,
            expired_at: accessToken.expired_at
          },
          {
            user_id: userId,
            type: 'REFRESH',
            token: refreshToken.token,
            expired_at: refreshToken.expired_at
          }
        ]
      })
    ])
  }

  /**
   * Refresh token
   *
   * @param {UserRefreshTokenRequest} req - Request object {refresh_token: string}
   * @returns {Promise<TokenResponse>} TokenResponse
   */
  static async refreshToken(
    req: UserRefreshTokenRequest
  ): Promise<TokenResponse> {
    const { refresh_token } = Validation.validate(
      AuthValidation.REFRESH_TOKEN,
      req
    )

    const decoded = jwt.verify(
      refresh_token,
      process.env.JWT_REFRESH_SECRET as string
    ) as { id: string }
    const userId = decoded.id

    const isTokenValid = await prisma.userToken.findFirst({
      where: {
        user_id: userId,
        type: 'REFRESH',
        token: refresh_token
      },
      select: { id: true }
    })

    if (!isTokenValid)
      throw new FormattedResponseError(
        401,
        'Oops, your token is invalid. Please refresh your token or log in again'
      )

    const newAccessToken = this.generateToken('ACCESS', userId)
    const newRefreshToken = this.generateToken('REFRESH', userId)

    await prisma.$transaction([
      prisma.userToken.deleteMany({
        where: {
          user_id: userId,
          type: 'REFRESH',
          token: refresh_token
        }
      })
    ])

    await this.insertToken(userId, newAccessToken, newRefreshToken)

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken
    }
  }
}
