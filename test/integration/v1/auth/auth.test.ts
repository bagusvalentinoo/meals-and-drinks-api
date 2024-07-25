import supertest from 'supertest'
import { web } from '@src/app/web'
import { AuthTest } from '@test/test.util'

describe('Auth API Test', () => {
  beforeEach(async () => {
    await AuthTest.createUserRoleAdminTest()
    await AuthTest.createUserRoleUserTest()
    await AuthTest.createGeneralApiKey()
  })

  afterEach(async () => {
    await AuthTest.cleanUpData()
  })

  const signIn = async (
    is_authorized_api_key: boolean,
    email: string,
    password: string
  ) => {
    return await supertest(web)
      .post('/api/v1/auth/sign-in')
      .set('x-api-key', is_authorized_api_key ? 'general_api_key_test' : '')
      .send({ email, password })
  }

  const signUp = async (
    is_authorized_api_key: boolean,
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => {
    return await supertest(web)
      .post('/api/v1/auth/sign-up')
      .set('x-api-key', is_authorized_api_key ? 'general_api_key_test' : '')
      .send({ name, email, password, password_confirmation })
  }

  const refreshToken = async (
    is_authorized_api_key: boolean,
    refresh_token: string
  ) => {
    return await supertest(web)
      .post('/api/v1/auth/refresh-token')
      .set('x-api-key', is_authorized_api_key ? 'general_api_key_test' : '')
      .send({ refresh_token })
  }

  const signOut = async (
    is_authorized_api_key: boolean,
    authorization_token: string,
    access_token: string,
    refresh_token: string
  ) => {
    return await supertest(web)
      .post('/api/v1/auth/sign-out')
      .set('x-api-key', is_authorized_api_key ? 'general_api_key_test' : '')
      .set('Authorization', `Bearer ${authorization_token}`)
      .send({
        access_token: access_token,
        refresh_token: refresh_token
      })
  }

  const me = async (
    is_authorized_api_key: boolean,
    authorization_token: string
  ) => {
    return await supertest(web)
      .get('/api/v1/auth/me')
      .set('x-api-key', is_authorized_api_key ? 'general_api_key_test' : '')
      .set('Authorization', `Bearer ${authorization_token}`)
  }

  describe('POST /api/v1/auth/sign-in', () => {
    it('should be able to sign in with user role Admin', async () => {
      const response = await signIn(
        true,
        'user_role_admin_test@example.com',
        'user_role_admin_test'
      )

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user).toBeDefined()
      expect(response.body.data.access_token).toBeDefined()
      expect(response.body.data.refresh_token).toBeDefined()
      expect(
        response.body.data.user.roles.some(
          (role: { name: string }) => role.name === 'ADMIN'
        )
      ).toBe(true)
    })

    it('should be able to sign in with user role User', async () => {
      const response = await signIn(
        true,
        'user_role_user_test@example.com',
        'user_role_user_test'
      )

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user).toBeDefined()
      expect(response.body.data.access_token).toBeDefined()
      expect(response.body.data.refresh_token).toBeDefined()
      expect(
        response.body.data.user.roles.some(
          (role: { name: string }) => role.name === 'USER'
        )
      ).toBe(true)
    })

    it('should not be able to sign in with no provided x-api-key header', async () => {
      const response = await signIn(
        false,
        'user_role_user_test@example.com',
        'user_role_user_test'
      )

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to sign in with incorrect email or password', async () => {
      const response = await signIn(true, 'test@example.com', 'wrong_password')

      console.debug(response.body)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to sign in with invalid email', async () => {
      const response = await signIn(true, 'testinvalidemail.com', '')

      console.debug(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to sign in with empty or empty string email or password', async () => {
      const response = await signIn(true, '', '')

      console.debug(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })

  describe('POST /api/v1/auth/sign-up', () => {
    it('should be able to sign up new user', async () => {
      const response = await signUp(
        true,
        'User Role User Test 2',
        'user_role_user_test_2@example.com',
        'user_role_user_test_2',
        'user_role_user_test_2'
      )

      console.debug(response.body)
      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user).toBeDefined()
      expect(
        response.body.data.user.roles.some(
          (role: { name: string }) => role.name === 'USER'
        )
      ).toBe(true)
    })

    it('should not be able to sign up with no provided x-api-key header', async () => {
      const response = await signUp(
        false,
        'User Role User Test 2',
        'user_role_user_test_2@example.com',
        'user_role_user_test_2',
        'user_role_user_test_2'
      )

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to sign up with empty or empty string name, email, password, or password confirmation', async () => {
      const response = await signUp(true, '', '', '', '')

      console.debug(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to sign up with existing email', async () => {
      const response = await signUp(
        true,
        'User Role User Test',
        'user_role_user_test@example.com',
        'user_role_user_test',
        'user_role_user_test'
      )

      console.debug(response.body)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toContain('already exists')
    })

    it('should not be able to sign up with invalid email', async () => {
      const response = await signUp(
        true,
        'User Role User Test 2',
        'testinvalidemail.com',
        'user_role_user_test_2',
        'user_role_user_test_2'
      )

      console.debug(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to sign up with password or password confirmation less than 8 characters', async () => {
      const response = await signUp(
        true,
        'User Role User Test 2',
        'user_role_user_test_2@example.com',
        'less8',
        'less8'
      )

      console.debug(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to sign up with password and password confirmation not match', async () => {
      const response = await signUp(
        true,
        'User Role User Test',
        'user_role_user_test@example.com',
        'user_role_user_test',
        'user_role_user_test_not_match'
      )

      console.debug(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })

  describe('POST /api/v1/auth/refresh-token', () => {
    it('should be able to refresh token as user role Admin', async () => {
      const responseSignIn = await signIn(
        true,
        'user_role_admin_test@example.com',
        'user_role_admin_test'
      )

      const response = await refreshToken(
        true,
        responseSignIn.body.data.refresh_token.token
      )

      console.debug(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.access_token).toBeDefined()
      expect(response.body.data.refresh_token).toBeDefined()
    })

    it('should be able to refresh token as user role User', async () => {
      const responseSignIn = await signIn(
        true,
        'user_role_user_test@example.com',
        'user_role_user_test'
      )

      const response = await refreshToken(
        true,
        responseSignIn.body.data.refresh_token.token
      )

      console.debug(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.access_token).toBeDefined()
      expect(response.body.data.refresh_token).toBeDefined()
    })

    it('should not be able to refresh token with no provided x-api-key header', async () => {
      const responseSignIn = await signIn(
        true,
        'user_role_user_test@example.com',
        'user_role_user_test'
      )
      const response = await refreshToken(
        false,
        responseSignIn.body.data.refresh_token.token
      )

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to refresh token with empty or empty string refresh token', async () => {
      const response = await refreshToken(true, '')

      console.debug(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to refresh token with invalid token', async () => {
      const anonymousToken = AuthTest.createAnonymousToken()

      const response = await refreshToken(true, anonymousToken)

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to refresh token with refresh token expired', async () => {
      const tokenExpired = AuthTest.createRefreshTokenExpired()

      const response = await refreshToken(true, tokenExpired)

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })

  describe('GET /api/v1/auth/me', () => {
    it('should be able to get user profile as user role Admin', async () => {
      const responseSignIn = await signIn(
        true,
        'user_role_admin_test@example.com',
        'user_role_admin_test'
      )

      const response = await me(
        true,
        responseSignIn.body.data.access_token.token
      )

      console.debug(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user).toBeDefined()
      expect(
        response.body.data.user.roles.some(
          (role: { name: string }) => role.name === 'ADMIN'
        )
      ).toBe(true)
    })

    it('should be able to get user profile as user role User', async () => {
      const responseSignIn = await signIn(
        true,
        'user_role_user_test@example.com',
        'user_role_user_test'
      )

      const response = await me(
        true,
        responseSignIn.body.data.access_token.token
      )

      console.debug(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user).toBeDefined()
      expect(
        response.body.data.user.roles.some(
          (role: { name: string }) => role.name === 'USER'
        )
      ).toBe(true)
    })

    it('should not be able to get user profile with no provided x-api-key header', async () => {
      const responseSignIn = await signIn(
        true,
        'user_role_user_test@example.com',
        'user_role_user_test'
      )

      const response = await me(
        false,
        responseSignIn.body.data.access_token.token
      )

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get user profile with no authorization header access token', async () => {
      const response = await me(true, '')

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get user profile with invalid authorization header access token', async () => {
      const anonymousToken = AuthTest.createAnonymousToken()

      const response = await me(true, anonymousToken)

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get user profile with expired authorization header access token', async () => {
      const tokenExpired = AuthTest.createAccessTokenExpired()

      const response = await me(true, tokenExpired)

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })

  describe('POST /api/v1/auth/sign-out', () => {
    it('should be able to log out as user role Admin', async () => {
      const responseSignIn = await signIn(
        true,
        'user_role_admin_test@example.com',
        'user_role_admin_test'
      )

      const accessToken = responseSignIn.body.data.access_token.token
      const refreshToken = responseSignIn.body.data.refresh_token.token

      const response = await signOut(
        true,
        accessToken,
        accessToken,
        refreshToken
      )

      console.debug(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should be able to log out as user role User', async () => {
      const responseSignIn = await signIn(
        true,
        'user_role_user_test@example.com',
        'user_role_user_test'
      )

      const accessToken = responseSignIn.body.data.access_token.token
      const refreshToken = responseSignIn.body.data.refresh_token.token

      const response = await signOut(
        true,
        accessToken,
        accessToken,
        refreshToken
      )

      console.debug(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should not be able to log out with no provided x-api-key header', async () => {
      const responseSignIn = await signIn(
        true,
        'user_role_user_test@example.com',
        'user_role_user_test'
      )

      const accessToken = responseSignIn.body.data.access_token.token
      const refreshToken = responseSignIn.body.data.refresh_token.token

      const response = await signOut(
        false,
        accessToken,
        accessToken,
        refreshToken
      )

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to log out with empty or empty string access token or refresh token', async () => {
      const responseSignIn = await signIn(
        true,
        'user_role_user_test@example.com',
        'user_role_user_test'
      )

      const accessToken = responseSignIn.body.data.access_token.token as string

      const response = await signOut(true, accessToken, accessToken, '')

      console.debug(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to log out with no authorization header access token', async () => {
      const responseSignIn = await signIn(
        true,
        'user_role_user_test@example.com',
        'user_role_user_test'
      )

      const accessToken = responseSignIn.body.data.access_token.token as string
      const refreshToken = responseSignIn.body.data.refresh_token
        .token as string

      const response = await signOut(true, '', accessToken, refreshToken)

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to log out with invalid authorization header access token', async () => {
      const anonymousToken = AuthTest.createAnonymousToken()

      const response = await signOut(
        true,
        anonymousToken,
        anonymousToken,
        anonymousToken
      )

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to log out with expired authorization header access token', async () => {
      const tokenExpired = AuthTest.createAccessTokenExpired()

      const response = await signOut(
        true,
        tokenExpired,
        tokenExpired,
        tokenExpired
      )

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })
})
