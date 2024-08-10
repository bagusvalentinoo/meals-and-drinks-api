import supertest from 'supertest'
import path from 'path'
import { web } from '@src/app/web'
import { AuthTest, CategoryTest, FileTest } from '@test/test.util'

describe('Admin Category API Test', () => {
  beforeEach(async () => {
    await AuthTest.createUserRoleAdminTest()
    await AuthTest.createUserRoleUserTest()
    await AuthTest.createGeneralApiKey()
    await CategoryTest.createCategoryTest()
  })

  afterEach(async () => {
    await CategoryTest.cleanUpDataCategoryAndAssociatedCategoryData()
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

  const getCategories = async (
    apiKey: string,
    accessToken: string,
    page?: number,
    size?: number,
    orderBy?: string,
    orderDir?: string,
    search?: string
  ) => {
    return await supertest(web)
      .get('/api/v1/admin/categories')
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page, size, order_by: orderBy, order_dir: orderDir, search })
  }

  const createCategory = async (
    apiKey: string,
    accessToken: string,
    name: string,
    photo: string
  ) => {
    return await supertest(web)
      .post('/api/v1/admin/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-api-key', apiKey)
      .attach('photo', photo ? path.resolve(__dirname, photo) : '')
      .field('name', name)
  }

  const getCategory = async (
    apiKey: string,
    accessToken: string,
    categoryId: string
  ) => {
    return await supertest(web)
      .get(`/api/v1/admin/categories/${categoryId}`)
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${accessToken}`)
  }

  const updateCategory = async (
    apiKey: string,
    accessToken: string,
    categoryId: string,
    name: string,
    photo: string
  ) => {
    return await supertest(web)
      .put(`/api/v1/admin/categories/${categoryId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-api-key', apiKey)
      .attach('photo', photo ? path.resolve(__dirname, photo) : '')
      .field('name', name)
  }

  const deleteSingleCategory = async (
    apiKey: string,
    accessToken: string,
    categoryId: string
  ) => {
    return await supertest(web)
      .delete(`/api/v1/admin/categories/${categoryId}`)
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${accessToken}`)
  }

  const deleteBatchCategories = async (
    apiKey: string,
    accessToken: string,
    categoryIds: string[]
  ) => {
    return await supertest(web)
      .delete('/api/v1/admin/categories')
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ids: categoryIds })
  }

  describe('GET /api/v1/admin/categories', () => {
    it('should be able to get all categories with pagination', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getCategories(validApiKey, accessToken)

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.categories).toBeDefined()
      expect(response.body.data.pagination).toBeDefined()
    })

    it('should be able to get all categories with pagination with custom query page and size', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getCategories(validApiKey, accessToken, 3, 30)

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.categories).toHaveLength(30)
      expect(response.body.data.pagination.total_items).toBe(100)
      expect(response.body.data.pagination.total_pages).toBe(4)
      expect(response.body.data.pagination.current_page).toBe(3)
      expect(response.body.data.pagination.next_page).toBe(4)
      expect(response.body.data.pagination.prev_page).toBe(2)
      expect(response.body.data.pagination.size).toBe(30)
    })

    it('should be able to get all categories with pagination with custom query page and size out of range', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getCategories(validApiKey, accessToken, 11, 10)

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.categories).toHaveLength(0)
      expect(response.body.data.pagination.total_items).toBe(100)
      expect(response.body.data.pagination.total_pages).toBe(10)
      expect(response.body.data.pagination.current_page).toBe(11)
      expect(response.body.data.pagination.next_page).toBe(null)
      expect(response.body.data.pagination.prev_page).toBe(10)
      expect(response.body.data.pagination.size).toBe(10)
    })

    it('should be able to get all categories with pagination with default query order by updated_at direction desc', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getCategories(validApiKey, accessToken)

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.categories).toHaveLength(10)
      expect(response.body.data.categories[0].name).toBe('Category Test 100')
      expect(response.body.data.categories[1].name).toBe('Category Test 99')
      expect(response.body.data.pagination.total_items).toBe(100)
      expect(response.body.data.pagination.total_pages).toBe(10)
      expect(response.body.data.pagination.current_page).toBe(1)
      expect(response.body.data.pagination.next_page).toBe(2)
      expect(response.body.data.pagination.prev_page).toBe(null)
      expect(response.body.data.pagination.size).toBe(10)
    })

    it('should be able to get all categories with pagination with query order by updated_at direction asc', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getCategories(
        validApiKey,
        accessToken,
        undefined,
        undefined,
        undefined,
        'asc'
      )

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.categories).toHaveLength(10)
      expect(response.body.data.categories[0].name).toBe('Category Test 1')
      expect(response.body.data.categories[1].name).toBe('Category Test 2')
      expect(response.body.data.pagination.total_items).toBe(100)
      expect(response.body.data.pagination.total_pages).toBe(10)
      expect(response.body.data.pagination.current_page).toBe(1)
      expect(response.body.data.pagination.next_page).toBe(2)
      expect(response.body.data.pagination.prev_page).toBe(null)
      expect(response.body.data.pagination.size).toBe(10)
    })

    it('should be able to get all categories with pagination with custom query order by name and order direction asc', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getCategories(
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
      expect(response.body.data.categories).toHaveLength(10)
      expect(response.body.data.categories[0].name).toBe('Category Test 1')
      expect(response.body.data.pagination.total_items).toBe(100)
      expect(response.body.data.pagination.total_pages).toBe(10)
      expect(response.body.data.pagination.current_page).toBe(1)
      expect(response.body.data.pagination.next_page).toBe(2)
      expect(response.body.data.pagination.prev_page).toBe(null)
      expect(response.body.data.pagination.size).toBe(10)
    })

    it('should be able to get all categories with pagination with custom query order by name and order direction desc', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getCategories(
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
      expect(response.body.data.categories).toHaveLength(10)
      expect(response.body.data.categories[0].name).toBe('Category Test 99')
      expect(response.body.data.pagination.total_items).toBe(100)
      expect(response.body.data.pagination.total_pages).toBe(10)
      expect(response.body.data.pagination.current_page).toBe(1)
      expect(response.body.data.pagination.next_page).toBe(2)
      expect(response.body.data.pagination.prev_page).toBe(null)
      expect(response.body.data.pagination.size).toBe(10)
    })

    it('should be able to get all categories with pagination with custom query order by slug and order direction asc', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getCategories(
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
      expect(response.body.data.categories).toHaveLength(10)
      expect(response.body.data.categories[0].slug).toBe('category-test-1')
      expect(response.body.data.pagination.total_items).toBe(100)
      expect(response.body.data.pagination.total_pages).toBe(10)
      expect(response.body.data.pagination.current_page).toBe(1)
      expect(response.body.data.pagination.next_page).toBe(2)
      expect(response.body.data.pagination.prev_page).toBe(null)
      expect(response.body.data.pagination.size).toBe(10)
    })

    it('should be able to get all categories with pagination with custom query order by slug and order direction desc', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getCategories(
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
      expect(response.body.data.categories).toHaveLength(10)
      expect(response.body.data.categories[0].slug).toBe('category-test-99')
      expect(response.body.data.pagination.total_items).toBe(100)
      expect(response.body.data.pagination.total_pages).toBe(10)
      expect(response.body.data.pagination.current_page).toBe(1)
      expect(response.body.data.pagination.next_page).toBe(2)
      expect(response.body.data.pagination.prev_page).toBe(null)
      expect(response.body.data.pagination.size).toBe(10)
    })

    it('should be able to get all categories with pagination with custom query search', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getCategories(
        validApiKey,
        accessToken,
        undefined,
        undefined,
        undefined,
        undefined,
        'Category Test 100'
      )

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.categories).toHaveLength(1)
      expect(response.body.data.categories[0].name).toBe('Category Test 100')
      expect(response.body.data.pagination.total_items).toBe(1)
      expect(response.body.data.pagination.total_pages).toBe(1)
      expect(response.body.data.pagination.current_page).toBe(1)
      expect(response.body.data.pagination.next_page).toBe(null)
      expect(response.body.data.pagination.prev_page).toBe(null)
      expect(response.body.data.pagination.size).toBe(10)
    })

    it('should not be able to get all categories with pagination with unauthorized API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getCategories('', accessToken)

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get all categories with pagination with invalid API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getCategories('invalid_api_key', accessToken)

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get all categories with pagination with unauthorized access token', async () => {
      const response = await getCategories(validApiKey, '')

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get all categories with pagination with invalid access token', async () => {
      const anonymousToken = AuthTest.createAnonymousToken()
      const response = await getCategories(validApiKey, anonymousToken)

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get all categories with pagination with expired access token', async () => {
      const accessTokenExpired = AuthTest.createAccessTokenExpired()
      const response = await getCategories(validApiKey, accessTokenExpired)

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get all categories with pagination with authorized as user role', async () => {
      const accessToken = await signIn(
        userRoleUserTestEmail,
        userRoleUserTestPassword
      )
      const response = await getCategories(validApiKey, accessToken)

      console.log(response.body)
      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get all categories with pagination with invalid query page and size', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getCategories(validApiKey, accessToken, 0, 0)

      console.log(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })

  describe('POST /api/v1/admin/categories', () => {
    it('should be able to create category with photo extension .jpg', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const categoryName = 'Category Test 101'
      const response = await createCategory(
        validApiKey,
        accessToken,
        categoryName,
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryPhotoPath = await CategoryTest.getCategoryPhotoPathById(
        response.body.data.category.id
      )

      console.log(response.body)
      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.category).toBeDefined()
      expect(response.body.data.category.photo_url).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(true)
      await CategoryTest.cleanUpDataCategoryCreatedOrUpdated(categoryName)
    })

    it('should be able to create category with photo extension .png', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const categoryName = 'Category Test 101'
      const response = await createCategory(
        validApiKey,
        accessToken,
        categoryName,
        '../../../../public/test/images/product/category/safe_valid_photo.png'
      )
      const categoryPhotoPath = await CategoryTest.getCategoryPhotoPathById(
        response.body.data.category.id
      )

      console.log(response.body)
      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.category).toBeDefined()
      expect(response.body.data.category.photo_url).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(true)
      await CategoryTest.cleanUpDataCategoryCreatedOrUpdated(categoryName)
    })

    it('should be able to create category with photo extension .jpeg', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const categoryName = 'Category Test 101'
      const response = await createCategory(
        validApiKey,
        accessToken,
        categoryName,
        '../../../../public/test/images/product/category/safe_valid_photo.jpeg'
      )
      const categoryPhotoPath = await CategoryTest.getCategoryPhotoPathById(
        response.body.data.category.id
      )

      console.log(response.body)
      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.category).toBeDefined()
      expect(response.body.data.category.photo_url).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(true)
      await CategoryTest.cleanUpDataCategoryCreatedOrUpdated(categoryName)
    })

    it('should not be able to create category with unauthorized API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await createCategory(
        'a',
        accessToken,
        'Category Test 101',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/safe_valid_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to create category with invalid API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await createCategory(
        'invalid_api_key',
        accessToken,
        'Category Test 101',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/safe_valid_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to create category with unauthorized access token', async () => {
      const response = await createCategory(
        validApiKey,
        '',
        'Category Test 101',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/safe_valid_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to create category with invalid access token', async () => {
      const anonymousToken = AuthTest.createAnonymousToken()
      const response = await createCategory(
        validApiKey,
        anonymousToken,
        'Category Test 101',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/safe_valid_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to create category with expired access token', async () => {
      const accessTokenExpired = AuthTest.createAccessTokenExpired()
      const response = await createCategory(
        validApiKey,
        accessTokenExpired,
        'Category Test 101',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/safe_valid_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to create category with authorized as user role', async () => {
      const accessToken = await signIn(
        userRoleUserTestEmail,
        userRoleUserTestPassword
      )
      const response = await createCategory(
        validApiKey,
        accessToken,
        'Category Test 101',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/safe_valid_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to create category with empty name field', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await createCategory(
        validApiKey,
        accessToken,
        '',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/safe_valid_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to create category with empty photo field', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await createCategory(
        validApiKey,
        accessToken,
        'Category Test 101',
        ''
      )

      console.log(response.body)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to create category with invalid extension photo field', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await createCategory(
        validApiKey,
        accessToken,
        'Category Test 101',
        '../../../../public/test/images/product/category/pdf_photo.pdf'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/pdf_photo.pdf'
      )

      console.log(response.body)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to create category with photo size more than 1MB', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await createCategory(
        validApiKey,
        accessToken,
        'Category Test 101',
        '../../../../public/test/images/product/category/large_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/large_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to create category with file renamed to .jpg but not an image file or dangerous file', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await createCategory(
        validApiKey,
        accessToken,
        'Category Test 101',
        '../../../../public/test/images/product/category/dangerous_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/dangerous_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })
  })

  describe('GET /api/v1/admin/categories/:id', () => {
    it('should be able to get single category', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getCategory(validApiKey, accessToken, '100')

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.category).toBeDefined()
    })

    it('should not be able to get single category with unauthorized API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getCategory('', accessToken, '100')

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get single category with invalid API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getCategory('invalid_api_key', accessToken, '100')

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get single category with unauthorized access token', async () => {
      const response = await getCategory(validApiKey, '', '100')

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get single category with invalid access token', async () => {
      const anonymousToken = AuthTest.createAnonymousToken()
      const response = await getCategory(validApiKey, anonymousToken, '100')

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get single category with expired access token', async () => {
      const accessTokenExpired = AuthTest.createAccessTokenExpired()
      const response = await getCategory(validApiKey, accessTokenExpired, '100')

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get single category with authorized as user role', async () => {
      const accessToken = await signIn(
        userRoleUserTestEmail,
        userRoleUserTestPassword
      )
      const response = await getCategory(validApiKey, accessToken, '100')

      console.log(response.body)
      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to get single category with not found params category ID', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await getCategory(validApiKey, accessToken, '999')

      console.log(response.body)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })

  describe('PUT /api/v1/admin/categories/:id', () => {
    it('should be able to update category with photo', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const categoryName = 'Category Test 100 Updated'
      const response = await updateCategory(
        validApiKey,
        accessToken,
        '100',
        categoryName,
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryPhotoPath =
        await CategoryTest.getCategoryPhotoPathById('100')

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.category).toBeDefined()
      expect(response.body.data.category.name).toBe('Category Test 100 Updated')
      expect(response.body.data.category.photo_url).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(true)
      await CategoryTest.cleanUpDataCategoryCreatedOrUpdated(categoryName)
    })

    it('should be able to update category and change old photo with new photo', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const categoryName = 'Category Test 100 Updated'
      const responseCategoryUpdated = await updateCategory(
        validApiKey,
        accessToken,
        '100',
        'Category Test 100',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryOldPhotoPath =
        await CategoryTest.getCategoryPhotoPathById('100')
      const categoryOldPhotoUrl =
        responseCategoryUpdated.body.data.category.photo_url
      const response = await updateCategory(
        validApiKey,
        accessToken,
        '100',
        categoryName,
        '../../../../public/test/images/product/category/safe_valid_photo.png'
      )
      const categoryPhotoPath =
        await CategoryTest.getCategoryPhotoPathById('100')

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.category).toBeDefined()
      expect(response.body.data.category.name).toBe('Category Test 100 Updated')
      expect(response.body.data.category.photo_url).toBeDefined()
      expect(response.body.data.category.photo_url).not.toBe(
        categoryOldPhotoUrl
      )
      expect(FileTest.isPhotoFileExists(categoryOldPhotoPath)).toBe(false)
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(true)
      await CategoryTest.cleanUpDataCategoryCreatedOrUpdated(categoryName)
    })

    it('should be able to update category without photo and old photo still exists', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const responseCategoryUpdated = await updateCategory(
        validApiKey,
        accessToken,
        '100',
        'Category Test 100',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryOldPhotoPath =
        await CategoryTest.getCategoryPhotoPathById('100')
      const categoryOldPhotoUrl =
        responseCategoryUpdated.body.data.category.photo_url

      const response = await updateCategory(
        validApiKey,
        accessToken,
        '100',
        'Category Test 100 Updated',
        ''
      )

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.category).toBeDefined()
      expect(response.body.data.category.name).toBe('Category Test 100 Updated')
      expect(response.body.data.category.photo_url).toBeDefined()
      expect(response.body.data.category.photo_url).toBe(categoryOldPhotoUrl)
      expect(FileTest.isPhotoFileExists(categoryOldPhotoPath)).toBe(true)
      await CategoryTest.cleanUpDataCategoryCreatedOrUpdated(
        'Category Test 100 Updated'
      )
    })

    it('should not be able to update category with unauthorized API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await updateCategory(
        'a',
        accessToken,
        '100',
        'Category Test 100 Updated',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/safe_valid_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to update category with invalid API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await updateCategory(
        'invalid_api_key',
        accessToken,
        '100',
        'Category Test 100 Updated',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/safe_valid_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to update category with unauthorized access token', async () => {
      const response = await updateCategory(
        validApiKey,
        '',
        '100',
        'Category Test 100 Updated',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/safe_valid_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to update category with invalid access token', async () => {
      const anonymousToken = AuthTest.createAnonymousToken()
      const response = await updateCategory(
        validApiKey,
        anonymousToken,
        '100',
        'Category Test 100 Updated',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/safe_valid_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to update category with expired access token', async () => {
      const accessTokenExpired = AuthTest.createAccessTokenExpired()
      const response = await updateCategory(
        validApiKey,
        accessTokenExpired,
        '100',
        'Category Test 100 Updated',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/safe_valid_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to update category with authorized as user role', async () => {
      const accessToken = await signIn(
        userRoleUserTestEmail,
        userRoleUserTestPassword
      )
      const response = await updateCategory(
        validApiKey,
        accessToken,
        '100',
        'Category Test 100 Updated',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/safe_valid_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to update category with empty name field', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await updateCategory(
        validApiKey,
        accessToken,
        '100',
        '',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/safe_valid_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(422)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to update category with invalid extension photo field', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await updateCategory(
        validApiKey,
        accessToken,
        '100',
        'Category Test 100 Updated',
        '../../../../public/test/images/product/category/pdf_photo.pdf'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/pdf_photo.pdf'
      )

      console.log(response.body)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to update category with photo size more than 1MB', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await updateCategory(
        validApiKey,
        accessToken,
        '100',
        'Category Test 100 Updated',
        '../../../../public/test/images/product/category/large_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/large_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to update category with file renamed to .jpg but not an image file or dangerous file', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await updateCategory(
        validApiKey,
        accessToken,
        '100',
        'Category Test 100 Updated',
        '../../../../public/test/images/product/category/dangerous_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/dangerous_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to update category with not found params category ID', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await updateCategory(
        validApiKey,
        accessToken,
        '999',
        'Category Test 100 Updated',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryPhotoPath = path.resolve(
        __dirname,
        '../../../../public/images/product/category/safe_valid_photo.jpg'
      )

      console.log(response.body)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })
  })

  describe('DELETE /api/v1/admin/categories/:id', () => {
    it('should be able to delete single category and delete photo in directory', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const responseCreateCategory = await createCategory(
        validApiKey,
        accessToken,
        'Category Test 101',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryId = responseCreateCategory.body.data.category.id
      const categoryPhotoPath =
        await CategoryTest.getCategoryPhotoPathById(categoryId)

      const response = await deleteSingleCategory(
        validApiKey,
        accessToken,
        categoryId
      )

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(FileTest.isPhotoFileExists(categoryPhotoPath)).toBe(false)
    })

    it('should not be able to delete single category with unauthorized API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await deleteSingleCategory('a', accessToken, '100')

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete single category with invalid API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await deleteSingleCategory(
        'invalid_api_key',
        accessToken,
        '100'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete single category with unauthorized access token', async () => {
      const response = await deleteSingleCategory(validApiKey, '', '100')

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete single category with invalid access token', async () => {
      const anonymousToken = AuthTest.createAnonymousToken()
      const response = await deleteSingleCategory(
        validApiKey,
        anonymousToken,
        '100'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete single category with expired access token', async () => {
      const accessTokenExpired = AuthTest.createAccessTokenExpired()
      const response = await deleteSingleCategory(
        validApiKey,
        accessTokenExpired,
        '100'
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete single category with authorized as user role', async () => {
      const accessToken = await signIn(
        userRoleUserTestEmail,
        userRoleUserTestPassword
      )
      const response = await deleteSingleCategory(
        validApiKey,
        accessToken,
        '100'
      )

      console.log(response.body)
      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete single category with not found params category ID', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await deleteSingleCategory(
        validApiKey,
        accessToken,
        '999'
      )

      console.log(response.body)
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })

  describe('DELETE /api/v1/admin/categories', () => {
    it('should be able to delete batch categories and delete photo in directory', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const responseCreateCategory1 = await createCategory(
        validApiKey,
        accessToken,
        'Category Test 101',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryId1 = responseCreateCategory1.body.data.category.id
      const categoryPhotoPath1 =
        await CategoryTest.getCategoryPhotoPathById(categoryId1)
      const responseCreateCategory2 = await createCategory(
        validApiKey,
        accessToken,
        'Category Test 102',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryId2 = responseCreateCategory2.body.data.category.id
      const categoryPhotoPath2 =
        await CategoryTest.getCategoryPhotoPathById(categoryId2)
      const responseCreateCategory3 = await createCategory(
        validApiKey,
        accessToken,
        'Category Test 103',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryId3 = responseCreateCategory3.body.data.category.id
      const categoryPhotoPath3 =
        await CategoryTest.getCategoryPhotoPathById(categoryId3)
      const response = await deleteBatchCategories(validApiKey, accessToken, [
        categoryId1,
        categoryId2,
        categoryId3
      ])

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('3')
      expect(FileTest.isPhotoFileExists(categoryPhotoPath1)).toBe(false)
      expect(FileTest.isPhotoFileExists(categoryPhotoPath2)).toBe(false)
      expect(FileTest.isPhotoFileExists(categoryPhotoPath3)).toBe(false)
    })

    it('should be able to delete batch categories even one of category ids not found and delete photo in directory', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const responseCreateCategory1 = await createCategory(
        validApiKey,
        accessToken,
        'Category Test 101',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryId1 = responseCreateCategory1.body.data.category.id
      const categoryPhotoPath1 =
        await CategoryTest.getCategoryPhotoPathById(categoryId1)
      const responseCreateCategory2 = await createCategory(
        validApiKey,
        accessToken,
        'Category Test 102',
        '../../../../public/test/images/product/category/safe_valid_photo.jpg'
      )
      const categoryId2 = responseCreateCategory2.body.data.category.id
      const categoryPhotoPath2 =
        await CategoryTest.getCategoryPhotoPathById(categoryId2)
      const response = await deleteBatchCategories(validApiKey, accessToken, [
        categoryId1,
        '999',
        categoryId2
      ])

      console.log(response.body)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('2')
      expect(FileTest.isPhotoFileExists(categoryPhotoPath1)).toBe(false)
      expect(FileTest.isPhotoFileExists(categoryPhotoPath2)).toBe(false)
    })

    it('should not be able to delete batch categories with unauthorized API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await deleteBatchCategories('a', accessToken, [
        '98',
        '99',
        '100'
      ])

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete batch categories with invalid API key', async () => {
      const accessToken = await signIn(
        userRoleAdminTestEmail,
        userRoleAdminTestPassword
      )
      const response = await deleteBatchCategories(
        'invalid_api_key',
        accessToken,
        ['98', '99', '100']
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete batch categories with unauthorized access token', async () => {
      const response = await deleteBatchCategories(validApiKey, '', [
        '98',
        '99',
        '100'
      ])

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete batch categories with invalid access token', async () => {
      const anonymousToken = AuthTest.createAnonymousToken()
      const response = await deleteBatchCategories(
        validApiKey,
        anonymousToken,
        ['98', '99', '100']
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete batch categories with expired access token', async () => {
      const accessTokenExpired = AuthTest.createAccessTokenExpired()
      const response = await deleteBatchCategories(
        validApiKey,
        accessTokenExpired,
        ['98', '99', '100']
      )

      console.log(response.body)
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })

    it('should not be able to delete batch categories with authorized as user role', async () => {
      const accessToken = await signIn(
        userRoleUserTestEmail,
        userRoleUserTestPassword
      )
      const response = await deleteBatchCategories(validApiKey, accessToken, [
        '98',
        '99',
        '100'
      ])

      console.log(response.body)
      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })
})
