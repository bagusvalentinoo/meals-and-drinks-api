import { prisma } from '@app/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type {
  UserIncludeRoles,
  UserResponse,
  UserSignInRequest,
  UserSignInResponse,
  UserSignUpRequest,
  UserSignUpResponse,
  UserSignOutRequest
} from '@type/model/user.type'
import { TokenService } from './token.service'
import { Validation } from '@validations/validation'
import { AuthValidation } from '@validations/auth/auth.validation'
import { RoleRepository } from '@repositories/user/role.repository'
import { FormattedResponseError } from '@utils/error/formatted_response_error.util'

export class AuthService {
  /**
   * Convert UserIncludeRoles to UserResponse
   *
   * @param {UserIncludeRoles} user - UserIncludeRoles
   * @returns {UserResponse} - UserResponse
   */
  private static toUserResponse(user: UserIncludeRoles): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      photo_profile_url: user.photo_profile_url,
      roles: user.roles.map((role) => ({
        id: role.role.id,
        name: role.role.name
      }))
    }
  }

  /**
   * Sign In user
   *
   * @param {UserSignInRequest} req - Request object {body: UserSignInRequest}
   * @returns {Promise<UserSignInResponse>} - UserSignInResponse
   */
  static async signIn(req: UserSignInRequest): Promise<UserSignInResponse> {
    const { email, password } = Validation.validate(AuthValidation.SIGN_IN, req)

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true }
    })

    const errorMessage =
      "Oops, your email or password doesn't match our records"

    if (!user) throw new FormattedResponseError(400, errorMessage)

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) throw new FormattedResponseError(400, errorMessage)

    const userSignedIn = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        roles: { include: { role: { select: { id: true, name: true } } } }
      }
    })

    const accessToken = TokenService.generateToken('ACCESS', user.id)
    const refreshToken = TokenService.generateToken('REFRESH', user.id)
    await TokenService.insertToken(user.id, accessToken, refreshToken)

    return {
      user: this.toUserResponse(userSignedIn!),
      access_token: {
        token: accessToken.token,
        expired_at: accessToken.expired_at
      },
      refresh_token: {
        token: refreshToken.token,
        expired_at: refreshToken.expired_at
      }
    }
  }

  /**
   * Sign Up user
   *
   * @param {UserSignUpRequest} req - Request object {body: UserSignUpRequest}
   * @returns {Promise<UserSignUpResponse>} - UserSignUpResponse
   */
  static async signUp(req: UserSignUpRequest): Promise<UserSignUpResponse> {
    const { name, email, password } = Validation.validate(
      AuthValidation.SIGN_UP,
      req
    )
    const roleUserId = await RoleRepository.getRoleUserId()
    const passwordHash = await bcrypt.hash(password, 10)

    const [user] = await prisma.$transaction([
      prisma.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          roles: {
            create: {
              role: { connect: { id: roleUserId } }
            }
          }
        },
        include: {
          roles: { include: { role: { select: { id: true, name: true } } } }
        }
      })
    ])

    return this.toUserResponse(user)
  }

  /**
   * Get user profile signed in
   *
   * @param {string} userId - User ID
   * @returns {Promise<UserResponse>} - UserResponse
   */
  static async me(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: { select: { id: true, name: true } } } }
      }
    })

    if (!user) throw new FormattedResponseError(404, 'Oops, user not found')

    return this.toUserResponse(user)
  }

  /**
   * Sign Out user
   *
   * @param {string} userId - User ID
   * @param {UserSignOutRequest} req - Request object {body: UserSignOutRequest}
   */
  static async signOut(userId: string, req: UserSignOutRequest) {
    const { access_token, refresh_token } = Validation.validate(
      AuthValidation.SIGN_OUT,
      req
    )

    const decodedAccessToken = jwt.verify(
      access_token,
      process.env.JWT_ACCESS_SECRET as string
    ) as { id: string }
    const userIdFromAccessToken = decodedAccessToken.id

    const decodedRefreshToken = jwt.verify(
      refresh_token,
      process.env.JWT_REFRESH_SECRET as string
    ) as { id: string }
    const userIdFromRefreshToken = decodedRefreshToken.id

    if (userIdFromAccessToken !== userId || userIdFromRefreshToken !== userId)
      throw new FormattedResponseError(
        401,
        'Oops, your token is invalid. Please refresh your token or log in again'
      )

    const isInvalidAccessToken = await prisma.userToken.findFirst({
      where: {
        user_id: userIdFromAccessToken,
        type: 'ACCESS',
        token: access_token
      },
      select: { id: true }
    })

    const isInvalidRefreshToken = await prisma.userToken.findFirst({
      where: {
        user_id: userIdFromRefreshToken,
        type: 'REFRESH',
        token: refresh_token
      },
      select: { id: true }
    })

    if (!isInvalidAccessToken || !isInvalidRefreshToken)
      throw new FormattedResponseError(
        401,
        'Oops, your token is invalid. Please refresh your token or log in again'
      )

    return prisma.$transaction([
      prisma.userToken.deleteMany({
        where: {
          user_id: userId,
          OR: [
            { type: 'ACCESS', token: access_token },
            { type: 'REFRESH', token: refresh_token }
          ]
        }
      })
    ])
  }
}
