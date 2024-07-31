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
    await AuthTest.cleanUpDataUserAuthAndAssociatedAssociatedUserAuthData()
  })

  const apiKey = 'general_api_key_test'
  const userRoleAdminTestEmail = 'user_role_admin_test@example.com'
  const userRoleAdminTestPassword = 'user_role_admin_test'
  const userRoleUserTestEmail = 'user_role_user_test@example.com'
  const userRoleUserTestPassword = 'user_role_user_test'

  const signIn = async (apiKey: string, email: string, password: string) => {
    return await supertest(web)
      .post('/api/v1/auth/sign-in')
      .set('x-api-key', apiKey)
      .send({ email, password })
  }

  const signUp = async (
    apiKey: string,
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => {
    return await supertest(web)
      .post('/api/v1/auth/sign-up')
      .set('x-api-key', apiKey)
      .send({ name, email, password, password_confirmation })
  }

  const refreshToken = async (apiKey: string, refresh_token: string) => {
    return await supertest(web)
      .post('/api/v1/auth/refresh-token')
      .set('x-api-key', apiKey)
      .send({ refresh_token })
  }

  const signOut = async (
    apiKey: string,
    authorizationToken: string,
    accessToken: string,
    refreshToken: string
  ) => {
    return await supertest(web)
      .post('/api/v1/auth/sign-out')
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${authorizationToken}`)
      .send({
        access_token: accessToken,
        refresh_token: refreshToken
      })
  }

  const me = async (apiKey: string, authorizationToken: string) => {
    return await supertest(web)
      .get('/api/v1/auth/me')
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${authorizationToken}`)
  }

  describe('POST /api/v1/auth/sign-in', () => {
    it('should be able to sign in with user role Admin', async () => {
      const response = await signIn(
        apiKey,
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
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
        apiKey,
        userRoleUserTestEmail,
        userRoleUserTestPassword
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

    it('should not be able to sign in with unauthorized API Key', async () => {
      const response = await signIn(
        '',
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to sign in with invalid API Key', async () => {
      const response = await signIn(
        'invalid_api_key',
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to sign in with incorrect email or password', async () => {
      const response = await signIn(
        apiKey,
        userRoleAdminTestEmail,
        'wrong_password'
      )

      console.debug(response.body)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to sign in with invalid email', async () => {
      const response = await signIn(
        apiKey,
        'testinvalidemail.com',
        userRoleAdminTestPassword
      )

      console.debug(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to sign in with empty or empty string email or password', async () => {
      const response = await signIn(apiKey, '', '')

      console.debug(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })

  describe('POST /api/v1/auth/sign-up', () => {
    it('should be able to sign up new user', async () => {
      const response = await signUp(
        apiKey,
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

    it('should not be able to sign up with unauthorized API Key', async () => {
      const response = await signUp(
        '',
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

    it('should not be able to sign up with invalid API Key', async () => {
      const response = await signUp(
        'invalid_api_key',
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
      const response = await signUp(apiKey, '', '', '', '')

      console.debug(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to sign up with existing email', async () => {
      const response = await signUp(
        apiKey,
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
        apiKey,
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
        apiKey,
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
        apiKey,
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
        apiKey,
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await refreshToken(
        apiKey,
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
        apiKey,
        userRoleUserTestEmail,
        userRoleUserTestPassword
      )
      const response = await refreshToken(
        apiKey,
        responseSignIn.body.data.refresh_token.token
      )

      console.debug(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.access_token).toBeDefined()
      expect(response.body.data.refresh_token).toBeDefined()
    })

    it('should not be able to refresh token with unauthorized API Key', async () => {
      const responseSignIn = await signIn(
        apiKey,
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await refreshToken(
        '',
        responseSignIn.body.data.refresh_token.token
      )

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to refresh token with invalid API Key', async () => {
      const responseSignIn = await signIn(
        apiKey,
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await refreshToken(
        'invalid_api_key',
        responseSignIn.body.data.refresh_token.token
      )

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to refresh token with empty or empty string refresh token', async () => {
      const response = await refreshToken(apiKey, '')

      console.debug(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to refresh token with invalid refresh token', async () => {
      const anonymousToken = AuthTest.createAnonymousToken()
      const response = await refreshToken(apiKey, anonymousToken)

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to refresh token with refresh token expired', async () => {
      const tokenExpired = AuthTest.createRefreshTokenExpired()
      const response = await refreshToken(apiKey, tokenExpired)

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })

  describe('GET /api/v1/auth/me', () => {
    it('should be able to get user profile as user role Admin', async () => {
      const responseSignIn = await signIn(
        apiKey,
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await me(
        apiKey,
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
        apiKey,
        userRoleUserTestEmail,
        userRoleUserTestPassword
      )
      const response = await me(
        apiKey,
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

    it('should not be able to get user profile with unauthorized API Key', async () => {
      const responseSignIn = await signIn(
        apiKey,
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await me('', responseSignIn.body.data.access_token.token)

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get user profile with invalid API Key', async () => {
      const responseSignIn = await signIn(
        apiKey,
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await me(
        'invalid_api_key',
        responseSignIn.body.data.access_token.token
      )

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get user profile with unauthorized access token', async () => {
      const response = await me(apiKey, '')

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get user profile with invalid access token', async () => {
      const anonymousToken = AuthTest.createAnonymousToken()
      const response = await me(apiKey, anonymousToken)

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get user profile with expired access token', async () => {
      const tokenExpired = AuthTest.createAccessTokenExpired()
      const response = await me(apiKey, tokenExpired)

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })

  describe('POST /api/v1/auth/sign-out', () => {
    it('should be able to log out as user role Admin', async () => {
      const responseSignIn = await signIn(
        apiKey,
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const accessToken = responseSignIn.body.data.access_token.token
      const refreshToken = responseSignIn.body.data.refresh_token.token
      const response = await signOut(
        apiKey,
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
        apiKey,
        userRoleUserTestEmail,
        userRoleUserTestPassword
      )
      const accessToken = responseSignIn.body.data.access_token.token
      const refreshToken = responseSignIn.body.data.refresh_token.token
      const response = await signOut(
        apiKey,
        accessToken,
        accessToken,
        refreshToken
      )

      console.debug(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should not be able to log out with no unauthorized API Key', async () => {
      const responseSignIn = await signIn(
        apiKey,
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const accessToken = responseSignIn.body.data.access_token.token
      const refreshToken = responseSignIn.body.data.refresh_token.token
      const response = await signOut('', accessToken, accessToken, refreshToken)

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to log out with invalid API Key', async () => {
      const responseSignIn = await signIn(
        apiKey,
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const accessToken = responseSignIn.body.data.access_token.token
      const refreshToken = responseSignIn.body.data.refresh_token.token
      const response = await signOut(
        'invalid_api_key',
        accessToken,
        accessToken,
        refreshToken
      )

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to log out with unauthorized access token', async () => {
      const responseSignIn = await signIn(
        apiKey,
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const accessToken = responseSignIn.body.data.access_token.token
      const refreshToken = responseSignIn.body.data.refresh_token.token
      const response = await signOut(apiKey, '', accessToken, refreshToken)

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to log out with invalid access token', async () => {
      const anonymousToken = AuthTest.createAnonymousToken()
      const response = await signOut(
        apiKey,
        anonymousToken,
        anonymousToken,
        anonymousToken
      )

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to log out with expired access token', async () => {
      const tokenExpired = AuthTest.createAccessTokenExpired()
      const response = await signOut(
        apiKey,
        tokenExpired,
        tokenExpired,
        tokenExpired
      )

      console.debug(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to log out with empty or empty string access token or refresh token', async () => {
      const responseSignIn = await signIn(
        apiKey,
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const accessToken = responseSignIn.body.data.access_token.token
      const response = await signOut(apiKey, accessToken, accessToken, '')

      console.debug(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })
})
