import { z, ZodType } from 'zod'
import {
  UserSignInRequest,
  UserSignUpRequest,
  UserRefreshTokenRequest,
  UserSignOutRequest
} from '@type/model/user.type'

export class AuthValidation {
  /**
   * Validate sign in
   *
   * @returns {ZodType<UserSignInRequest>}
   */
  static readonly SIGN_IN: ZodType<UserSignInRequest> = z.object({
    email: z
      .string({
        required_error: "Oops, email can't be empty"
      })
      .min(1, {
        message: "Oops, email can't be empty"
      })
      .email({
        message: 'Oops, email is invalid'
      }),
    password: z
      .string({
        required_error: "Oops, password can't be empty"
      })
      .min(1, {
        message: "Oops, password can't be empty"
      })
  })

  /**
   * Validate sign up
   *
   * @returns {ZodType<UserSignUpRequest>}
   */
  static readonly SIGN_UP: ZodType<UserSignUpRequest> = z
    .object({
      name: z
        .string({
          required_error: "Oops, name can't be empty"
        })
        .min(1, {
          message: "Oops, name can't be empty"
        }),
      email: z
        .string({
          required_error: "Oops, email can't be empty"
        })
        .min(1, {
          message: "Oops, email can't be empty"
        })
        .email({
          message: 'Oops, email is invalid'
        }),
      password: z
        .string({
          required_error: "Oops, password can't be empty"
        })
        .min(8, {
          message: 'Oops, password must be at least 8 characters long'
        }),
      password_confirmation: z
        .string({
          required_error: "Oops, password confirmation can't be empty"
        })
        .min(8, {
          message:
            'Oops, password confirmation must be at least 8 characters long'
        })
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: "Oops, password confirmation doesn't match",
      path: ['password_confirmation']
    })

  /**
   * Validate refresh token
   *
   * @returns {ZodType<UserRefreshTokenRequest>}
   */
  static readonly REFRESH_TOKEN: ZodType<UserRefreshTokenRequest> = z.object({
    refresh_token: z
      .string({
        required_error: "Oops, refresh token can't be empty"
      })
      .min(1, {
        message: "Oops, refresh token can't be empty"
      })
  })

  /**
   * Validate sign out
   *
   * @returns {ZodType<UserSignOutRequest>}
   */
  static readonly SIGN_OUT: ZodType<UserSignOutRequest> = z.object({
    access_token: z
      .string({
        required_error: "Oops, access token can't be empty"
      })
      .min(1, {
        message: "Oops, access token can't be empty"
      }),
    refresh_token: z
      .string({
        required_error: "Oops, refresh token can't be empty"
      })
      .min(1, {
        message: "Oops, refresh token can't be empty"
      })
  })
}
