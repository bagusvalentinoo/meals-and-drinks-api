import type { Request, Response, NextFunction } from 'express'
import { AuthService } from '@services/auth/auth.service'
import { TokenService } from '@services/auth/token.service'
import type {
  UserSignInRequest,
  UserSignUpRequest,
  UserRefreshTokenRequest,
  UserSignOutRequest
} from '@type/model/user.type'
import type { UserRequest } from '@type/http/user_request.type'
import { responseSuccess } from '@utils/http/response.util'

export class AuthController {
  /**
   * Sign In
   *
   * @param {Request} req - Request object {body: UserSignInRequest}
   * @param {Response} res - Response object
   * @param {NextFunction} next - Next function
   */
  static async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const request: UserSignInRequest = req.body as UserSignInRequest
      const signIn = await AuthService.signIn(request)

      return responseSuccess(
        res,
        200,
        'Horray! You have successfully signed in',
        signIn
      )
    } catch (error) {
      next(error)
    }

    return null
  }

  /**
   * Sign Up
   *
   * @param {Request} req - Request object {body: UserSignUpRequest}
   * @param {Response} res - Response object
   * @param {NextFunction} next - Next function
   */
  static async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const request: UserSignUpRequest = req.body as UserSignUpRequest
      const user = await AuthService.signUp(request)

      return responseSuccess(
        res,
        201,
        'Horray! You have successfully signed up',
        user,
        'user'
      )
    } catch (error) {
      next(error)
    }

    return null
  }

  /**
   * Refresh token
   *
   * @param {Request} req - Request object {body: UserRefreshTokenRequest}
   * @param {Response} res - Response object
   * @param {NextFunction} next - Next function
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const request: UserRefreshTokenRequest =
        req.body as UserRefreshTokenRequest
      const token = await TokenService.refreshToken(request)

      return responseSuccess(
        res,
        200,
        'Horray! You have successfully refreshed your token',
        token
      )
    } catch (error) {
      console.debug('Error: ', error)
      next(error)
    }

    return null
  }

  /**
   * Get user profile signed in
   *
   * @param {UserRequest} req - Request object
   * @param {Response} res - Response object
   * @param {NextFunction} next - Next function
   */
  static async me(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.me(req.user_id!)

      return responseSuccess(
        res,
        200,
        'Horray! You have successfully get your profile',
        user,
        'user'
      )
    } catch (error) {
      next(error)
    }

    return null
  }

  /**
   * Sign Out
   *
   * @param {UserRequest} req - Request object {body: UserSignOutRequest}
   * @param {Response} res - Response object
   * @param {NextFunction} next - Next function
   */
  static async signOut(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const request: UserSignOutRequest = req.body as UserSignOutRequest
      await AuthService.signOut(req.user_id!, request)

      return responseSuccess(
        res,
        200,
        'Horray! You have successfully signed out'
      )
    } catch (error) {
      next(error)
    }

    return null
  }
}
