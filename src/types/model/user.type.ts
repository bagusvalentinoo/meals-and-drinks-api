import type { User } from '@prisma/client'
import type { RoleResponse } from '@type/model/role.type'
import type { TokenResponse } from '@type/model/token.type'

export type UserCreatorOrUpdater = {
  id: string
  name: string
  photo_profile_url: string | null
}

export type UserIncludeRoles = {
  roles: ({
    role: {
      id: string
      name: string
    }
  } & {
    user_id: string
    role_id: string
  })[]
} & User

export type UserResponse = {
  id: string
  name: string
  email: string
  photo_profile_url: string | null
  roles: RoleResponse[]
}

export type UserSignInRequest = {
  email: string
  password: string
}

export type UserSignInResponse = {
  user: UserResponse
} & TokenResponse

export type UserSignUpRequest = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export type UserSignUpResponse = UserResponse

export type UserRefreshTokenRequest = {
  refresh_token: string
}

export type UserSignOutRequest = {
  access_token: string
  refresh_token: string
}
