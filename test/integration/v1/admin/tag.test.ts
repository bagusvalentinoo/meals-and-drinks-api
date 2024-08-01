import supertest from 'supertest'
import { web } from '@src/app/web'
import { AuthTest, TagTest } from '@test/test.util'

describe('Admin Tag API Test', () => {
  beforeEach(async () => {
    await AuthTest.createUserRoleAdminTest()
    await AuthTest.createUserRoleUserTest()
    await AuthTest.createGeneralApiKey()
    await TagTest.createTagTest()
  })

  afterEach(async () => {
    await TagTest.cleanUpDataTagAndAssociatedTagData()
  })

  const validApiKey = 'general_api_key_test'
  const userRoleAdminTestEmail = 'user_role_admin_test@example.com'
  const userRoleAdminTestPassword = 'user_role_admin_test'
  const userRoleUserTestEmail = 'user_role_user_test@example.com'
  const userRoleUserTestPassword = 'user_role_user_test'

  const signIn = async (email: string, password: string): Promise<string> => {
    const response = await supertest(web)
      .post('/api/v1/auth/sign-in')
      .set('x-api-key', validApiKey)
      .send({ email, password })

    return response.body.data.access_token.token
  }

  const getTags = async (
    apiKey: string,
    accessToken: string,
    page?: number,
    size?: number,
    orderBy?: string,
    orderDir?: string,
    search?: string
  ) => {
    return await supertest(web)
      .get('/api/v1/admin/tags')
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page, size, order_by: orderBy, order_dir: orderDir, search })
  }

  const createTags = async (
    apiKey: string,
    accessToken: string,
    names: string | string[]
  ) => {
    return await supertest(web)
      .post('/api/v1/admin/tags')
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ names })
  }

  const getTag = async (apiKey: string, accessToken: string, tagId: string) => {
    return await supertest(web)
      .get(`/api/v1/admin/tags/${tagId}`)
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${accessToken}`)
  }

  const updateTag = async (
    apiKey: string,
    accessToken: string,
    tagId: string,
    name: string
  ) => {
    return await supertest(web)
      .put(`/api/v1/admin/tags/${tagId}`)
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name })
  }

  const deleteSingeTag = async (
    apiKey: string,
    accessToken: string,
    tagId: string
  ) => {
    return await supertest(web)
      .delete(`/api/v1/admin/tags/${tagId}`)
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${accessToken}`)
  }

  const deleteBatchTags = async (
    apiKey: string,
    accessToken: string,
    tagIds: string[]
  ) => {
    return await supertest(web)
      .delete(`/api/v1/admin/tags`)
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ids: tagIds })
  }

  describe('GET /api/v1/admin/tags', () => {
    it('should be able to get all tags with pagination', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getTags(validApiKey, accessToken)

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.tags).toBeDefined()
      expect(response.body.data.pagination).toBeDefined()
    })

    it('should be able to get all tags with pagination with custom query page and size', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getTags(validApiKey, accessToken, 2, 20)

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.tags).toHaveLength(20)
      expect(response.body.data.pagination.total_items).toBe(100)
      expect(response.body.data.pagination.total_pages).toBe(5)
      expect(response.body.data.pagination.current_page).toBe(2)
      expect(response.body.data.pagination.next_page).toBe(3)
      expect(response.body.data.pagination.prev_page).toBe(1)
      expect(response.body.data.pagination.size).toBe(20)
    })

    it('should be able to get all tags with pagination with custom query page and size out of range', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getTags(validApiKey, accessToken, 6, 20)

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.tags).toHaveLength(0)
      expect(response.body.data.pagination.total_items).toBe(100)
      expect(response.body.data.pagination.total_pages).toBe(5)
      expect(response.body.data.pagination.current_page).toBe(6)
      expect(response.body.data.pagination.next_page).toBe(null)
      expect(response.body.data.pagination.prev_page).toBe(5)
      expect(response.body.data.pagination.size).toBe(20)
    })

    it('should be able to get all tags with pagination with default query order by created_at and updated_at direction desc', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getTags(validApiKey, accessToken)

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.tags).toHaveLength(10)
      expect(response.body.data.tags[0].name).toBe('Tag Test 100')
      expect(response.body.data.tags[1].name).toBe('Tag Test 99')
      expect(response.body.data.pagination.total_items).toBe(100)
      expect(response.body.data.pagination.total_pages).toBe(10)
      expect(response.body.data.pagination.current_page).toBe(1)
      expect(response.body.data.pagination.next_page).toBe(2)
      expect(response.body.data.pagination.prev_page).toBe(null)
      expect(response.body.data.pagination.size).toBe(10)
    })

    it('should be able to get all tags with pagination with custom query order by name and order direction asc', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getTags(
        validApiKey,
        accessToken,
        undefined,
        undefined,
        'name',
        'asc'
      )

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.tags).toHaveLength(10)
      expect(response.body.data.tags[0].name).toBe('Tag Test 1')
      expect(response.body.data.pagination.total_items).toBe(100)
      expect(response.body.data.pagination.total_pages).toBe(10)
      expect(response.body.data.pagination.current_page).toBe(1)
      expect(response.body.data.pagination.next_page).toBe(2)
      expect(response.body.data.pagination.prev_page).toBe(null)
      expect(response.body.data.pagination.size).toBe(10)
    })

    it('should be able to get all tags with pagination with custom query order by name and order direction desc', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getTags(
        validApiKey,
        accessToken,
        undefined,
        undefined,
        'name',
        'desc'
      )

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.tags).toHaveLength(10)
      expect(response.body.data.tags[0].name).toBe('Tag Test 99')
      expect(response.body.data.pagination.total_items).toBe(100)
      expect(response.body.data.pagination.total_pages).toBe(10)
      expect(response.body.data.pagination.current_page).toBe(1)
      expect(response.body.data.pagination.next_page).toBe(2)
      expect(response.body.data.pagination.prev_page).toBe(null)
      expect(response.body.data.pagination.size).toBe(10)
    })

    it('should be able to get all tags with pagination with custom query order by slug and order direction asc', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getTags(
        validApiKey,
        accessToken,
        undefined,
        undefined,
        'slug',
        'asc'
      )

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.tags).toHaveLength(10)
      expect(response.body.data.tags[0].slug).toBe('tag-test-1')
      expect(response.body.data.pagination.total_items).toBe(100)
      expect(response.body.data.pagination.total_pages).toBe(10)
      expect(response.body.data.pagination.current_page).toBe(1)
      expect(response.body.data.pagination.next_page).toBe(2)
      expect(response.body.data.pagination.prev_page).toBe(null)
      expect(response.body.data.pagination.size).toBe(10)
    })

    it('should be able to get all tags with pagination with custom query order by slug and order direction desc', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getTags(
        validApiKey,
        accessToken,
        undefined,
        undefined,
        'slug',
        'desc'
      )

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.tags).toHaveLength(10)
      expect(response.body.data.tags[0].slug).toBe('tag-test-99')
      expect(response.body.data.pagination.total_items).toBe(100)
      expect(response.body.data.pagination.total_pages).toBe(10)
      expect(response.body.data.pagination.current_page).toBe(1)
      expect(response.body.data.pagination.next_page).toBe(2)
      expect(response.body.data.pagination.prev_page).toBe(null)
      expect(response.body.data.pagination.size).toBe(10)
    })

    it('should be able to get all tags with pagination with custom query search', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getTags(
        validApiKey,
        accessToken,
        undefined,
        undefined,
        undefined,
        undefined,
        'Tag Test 100'
      )

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.tags).toHaveLength(1)
      expect(response.body.data.tags[0].name).toBe('Tag Test 100')
      expect(response.body.data.pagination.total_items).toBe(1)
      expect(response.body.data.pagination.total_pages).toBe(1)
      expect(response.body.data.pagination.current_page).toBe(1)
      expect(response.body.data.pagination.next_page).toBe(null)
      expect(response.body.data.pagination.prev_page).toBe(null)
      expect(response.body.data.pagination.size).toBe(10)
    })

    it('should not be able to get all tags with pagination with unauthorized API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getTags('', accessToken)

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get all tags with pagination with invalid API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getTags('invalid_api_key', accessToken)

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get all tags with pagination with unauthorized access token', async () => {
      const response = await getTags(validApiKey, '')

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get all tags with pagination with invalid access token', async () => {
      const anonymousToken = AuthTest.createAnonymousToken()
      const response = await getTags(validApiKey, anonymousToken)

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get all tags with pagination with expired access token', async () => {
      const accessTokenExpired = AuthTest.createAccessTokenExpired()
      const response = await getTags(validApiKey, accessTokenExpired)

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get all tags with pagination with authorized as user role', async () => {
      const accessToken = await signIn(
        userRoleUserTestEmail,
        userRoleUserTestPassword
      )
      const response = await getTags(validApiKey, accessToken)

      console.log(response.body)
      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get all tags with pagination with invalid query page and size', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getTags(validApiKey, accessToken, 0, 0)

      console.log(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })

  describe('POST /api/v1/admin/tags', () => {
    it('should be able to create single tag', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const names = 'Tag Test 101'
      const response = await createTags(validApiKey, accessToken, names)

      console.log(response.body)
      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.tags).toHaveLength(1)
      await TagTest.cleanUpDataTagCreatedOrUpdated(names)
    })

    it('should be able to create batch tags', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const names = [
        'Tag Test 102',
        'Tag Test 103',
        'Tag Test 104',
        'Tag Test 105',
        'Tag Test 106',
        'Tag Test 107',
        'Tag Test 108',
        'Tag Test 109',
        'Tag Test 110',
        'Tag Test 111'
      ]
      const response = await createTags(validApiKey, accessToken, names)

      console.log(response.body)
      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.tags).toHaveLength(10)
      await TagTest.cleanUpDataTagCreatedOrUpdated(names)
    })

    it('should not be able to create tags with unauthorized API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await createTags('', accessToken, [
        'Tag Test 102',
        'Tag Test 103',
        'Tag Test 104',
        'Tag Test 105',
        'Tag Test 106'
      ])

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to create tags with invalid API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await createTags('invalid_api_key', accessToken, [
        'Tag Test 102',
        'Tag Test 103',
        'Tag Test 104',
        'Tag Test 105',
        'Tag Test 106'
      ])

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to create tags with unauthorized access token', async () => {
      const response = await createTags('invalid_api_key', '', [
        'Tag Test 102',
        'Tag Test 103',
        'Tag Test 104',
        'Tag Test 105',
        'Tag Test 106'
      ])

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should be able to create tags with invalid access token', async () => {
      const anonymousToken = AuthTest.createAnonymousToken()
      const response = await createTags(validApiKey, anonymousToken, [
        'Tag Test 102',
        'Tag Test 103',
        'Tag Test 104',
        'Tag Test 105',
        'Tag Test 106'
      ])

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to create tags with expired access token', async () => {
      const accessTokenExpired = AuthTest.createAccessTokenExpired()
      const response = await createTags(validApiKey, accessTokenExpired, [
        'Tag Test 102',
        'Tag Test 103',
        'Tag Test 104',
        'Tag Test 105',
        'Tag Test 106'
      ])

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to create tags with authorized as user role', async () => {
      const accessToken = await signIn(
        userRoleUserTestEmail,
        userRoleUserTestPassword
      )
      const response = await createTags(validApiKey, accessToken, [
        'Tag Test 102',
        'Tag Test 103',
        'Tag Test 104',
        'Tag Test 105',
        'Tag Test 106'
      ])

      console.log(response.body)
      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to create single tag with empty or empty string', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await createTags(validApiKey, accessToken, '')

      console.log(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to create batch tags with empty or empty string', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await createTags(validApiKey, accessToken, [
        '',
        '',
        '',
        '',
        ''
      ])

      console.log(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to create tags with existing tag name', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await createTags(validApiKey, accessToken, [
        'Tag Test 102',
        'Tag Test 103',
        'Tag Test 104',
        'Tag Test 105',
        'Tag Test 1'
      ])

      console.log(response.body)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })

  describe('GET /api/v1/admin/tags/:id', () => {
    it('should be able to get single tag', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getTag(validApiKey, accessToken, '100')

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.tag).toBeDefined()
    })

    it('should not be able to get single tag with unauthorized API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getTag('', accessToken, '100')

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get single tag with invalid API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getTag('invalid_api_key', accessToken, '100')

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get single tag with unauthorized access token', async () => {
      const response = await getTag(validApiKey, '', '100')

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get single tag with invalid access token', async () => {
      const anonymousToken = AuthTest.createAnonymousToken()
      const response = await getTag(validApiKey, anonymousToken, '100')

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get single tag with expired access token', async () => {
      const accessTokenExpired = AuthTest.createAccessTokenExpired()
      const response = await getTag(validApiKey, accessTokenExpired, '100')

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get single tag with authorized as user role', async () => {
      const accessTokeUserRoleUser = await signIn(
        userRoleUserTestEmail,
        userRoleUserTestPassword
      )
      const response = await getTag(validApiKey, accessTokeUserRoleUser, '100')

      console.log(response.body)
      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get single tag with not found params tag ID', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getTag(
        validApiKey,
        accessToken,
        'not_found_tag_id'
      )

      console.log(response.body)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })

  describe('PUT /api/v1/admin/tags/:id', () => {
    it('should be able to update tag', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const tagName = 'Tag Test 100 Updated'
      const response = await updateTag(validApiKey, accessToken, '100', tagName)

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.tag.name).toBe(tagName)
      await TagTest.cleanUpDataTagCreatedOrUpdated(tagName)
    })

    it('should not be able to update tag with unauthorized API Key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await updateTag(
        '',
        accessToken,
        '100',
        'Tag Test 100 Updated'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to update tag with invalid API Key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await updateTag(
        'invalid_api_key',
        accessToken,
        '100',
        'Tag Test 100 Updated'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to update tag with unauthorized access token', async () => {
      const response = await updateTag(
        validApiKey,
        '',
        '100',
        'Tag Test 100 Updated'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to update tag with invalid access token', async () => {
      const anonymousToken = AuthTest.createAnonymousToken()
      const response = await updateTag(
        validApiKey,
        anonymousToken,
        '100',
        'Tag Test 100 Updated'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to update tag with expired access token', async () => {
      const accessTokenExpired = AuthTest.createAccessTokenExpired()
      const response = await updateTag(
        validApiKey,
        accessTokenExpired,
        '100',
        'Tag Test 100 Updated'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to update tag with authorized as user role', async () => {
      const accessTokeUserRoleUser = await signIn(
        userRoleUserTestEmail,
        userRoleUserTestPassword
      )
      const response = await updateTag(
        validApiKey,
        accessTokeUserRoleUser,
        '100',
        'Tag Test 100 Updated'
      )

      console.log(response.body)
      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to update tag with not found params tag ID', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await updateTag(
        validApiKey,
        accessToken,
        'not_found_tag_id',
        'Tag Test 100 Updated'
      )

      console.log(response.body)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to update tag with empty or empty string', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await updateTag(validApiKey, accessToken, '100', '')

      console.log(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to update tag with existing tag name', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await updateTag(
        validApiKey,
        accessToken,
        '100',
        'Tag Test 1'
      )

      console.log(response.body)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })

  describe('DELETE /api/v1/admin/tags/:id', () => {
    it('should be able to delete single tag', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await deleteSingeTag(validApiKey, accessToken, '100')

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should not be able to delete single tag with unauthorized API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await deleteSingeTag('', accessToken, '100')

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete single tag with invalid API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await deleteSingeTag(
        'invalid_api_key',
        accessToken,
        '100'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete single tag with unauthorized access token', async () => {
      const response = await deleteSingeTag(validApiKey, '', '100')

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete single tag with invalid access token', async () => {
      const anonymousToken = AuthTest.createAnonymousToken()
      const response = await deleteSingeTag(validApiKey, anonymousToken, '100')

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete single tag with expired access token', async () => {
      const accessTokenExpired = AuthTest.createAccessTokenExpired()
      const response = await deleteSingeTag(
        validApiKey,
        accessTokenExpired,
        '100'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete single tag with authorized as user role', async () => {
      const accessTokeUserRoleUser = await signIn(
        userRoleUserTestEmail,
        userRoleUserTestPassword
      )
      const response = await deleteSingeTag(
        validApiKey,
        accessTokeUserRoleUser,
        '100'
      )

      console.log(response.body)
      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete single tag with not found params tag ID', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await deleteSingeTag(
        validApiKey,
        accessToken,
        'not_found_tag_id'
      )

      console.log(response.body)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })

  describe('DELETE /api/v1/admin/tags', () => {
    it('should be able to delete batch tags', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const tagIds = ['100', '99', '98', '97', '96']
      const response = await deleteBatchTags(validApiKey, accessToken, tagIds)

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('5')
    })

    it('should be able to delete batch tags even one of tag ids not found', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const tagIds = ['100', '99', '98', '97']
      tagIds.push('not_found_tag_id')
      const response = await deleteBatchTags(validApiKey, accessToken, tagIds)

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('4')
    })

    it('should not be able to delete batch tags with unauthorized API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const tagIds = ['100', '99', '98', '97', '96']
      const response = await deleteBatchTags('', accessToken, tagIds)

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete batch tags with invalid API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const tagIds = ['100', '99', '98', '97', '96']
      const response = await deleteBatchTags(
        'invalid_api_key',
        accessToken,
        tagIds
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete batch tags with unauthorized access token', async () => {
      const tagIds = ['100', '99', '98', '97', '96']
      const response = await deleteBatchTags(validApiKey, '', tagIds)

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete batch tags with invalid access token', async () => {
      const anonymousToken = AuthTest.createAnonymousToken()
      const tagIds = ['100', '99', '98', '97', '96']
      const response = await deleteBatchTags(
        validApiKey,
        anonymousToken,
        tagIds
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete batch tags with expired access token', async () => {
      const accessTokenExpired = AuthTest.createAccessTokenExpired()
      const tagIds = ['100', '99', '98', '97', '96']
      const response = await deleteBatchTags(
        validApiKey,
        accessTokenExpired,
        tagIds
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete batch tags with authorized as user role', async () => {
      const accessTokeUserRoleUser = await signIn(
        userRoleUserTestEmail,
        userRoleUserTestPassword
      )
      const tagIds = ['100', '99', '98', '97', '96']
      const response = await deleteBatchTags(
        validApiKey,
        accessTokeUserRoleUser,
        tagIds
      )

      console.log(response.body)
      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete tags with empty or empty string tag ids', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await deleteBatchTags(validApiKey, accessToken, [
        '',
        '',
        '',
        '',
        ''
      ])

      console.log(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })
})
