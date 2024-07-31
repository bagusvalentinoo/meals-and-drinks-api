import { prisma } from '@src/app/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export class AuthTest {
  /**
   * Upsert role
   *
   * @param {string} name - Role name
   * @returns {Promise<{ id: string }>} - Role id
   */
  static async upsertRole(name: string): Promise<{ id: string }> {
    const [role] = await prisma.$transaction([
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
        select: { id: true }
      })
    ])
    return role
  }

  /**
   * Upsert user
   *
   * @param {string} email - User email
   * @param {string} name - User name
   * @param {string} password - User password
   * @param {string} roleId - Role id
   * @returns {Promise<{ id: string }>} - User id
   */
  static async upsertUser(
    email: string,
    name: string,
    password: string,
    roleId: string
  ): Promise<{ id: string }> {
    const [user] = await prisma.$transaction([
      prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          name,
          email,
          password: await bcrypt.hash(password, 10),
          roles: {
            create: {
              role: { connect: { id: roleId } }
            }
          }
        },
        select: { id: true }
      })
    ])

    return user
  }

  /**
   * Create user role Admin for sign in test
   *
   * @returns {Promise<void>}
   */
  static async createUserRoleAdminTest(): Promise<void> {
    const roleAdmin = await this.upsertRole('ADMIN')
    await this.upsertUser(
      'user_role_admin_test@example.com',
      'User Role Admin Test',
      'user_role_admin_test',
      roleAdmin.id
    )
  }

  /**
   * Create user role User for sign in test
   *
   * @returns {Promise<void>}
   */
  static async createUserRoleUserTest(): Promise<void> {
    const roleUser = await this.upsertRole('USER')
    await this.upsertUser(
      'user_role_user_test@example.com',
      'User Role User Test',
      'user_role_user_test',
      roleUser.id
    )
  }

  /**
   * Create general API key for test
   *
   * @returns {Promise<string>}
   */
  static async createGeneralApiKey(): Promise<string> {
    const roleAdmin = await this.upsertRole('ADMIN')
    const userRoleAdmin = await this.upsertUser(
      'user_role_admin_test@example.com',
      'User Role Admin Test',
      'user_role_admin_test',
      roleAdmin.id
    )

    const [apiKey] = await prisma.$transaction([
      prisma.apiKey.upsert({
        where: { key: 'general_api_key_test' },
        update: {},
        create: {
          user_id: userRoleAdmin.id,
          name: 'General API Key Test',
          slug: 'general-api-key-test',
          key: 'general_api_key_test',
          status: 'ACTIVE'
        },
        select: { key: true }
      })
    ])

    return apiKey.key
  }

  /**
   * Create anonymous token for test
   *
   * @returns {string}
   */
  static createAnonymousToken(): string {
    return jwt.sign({ id: 'anonymous_id' }, 'anonymous_secret', {
      expiresIn: '1d'
    })
  }

  /**
   * Create access token expired
   *
   * @returns {string}
   */
  static createAccessTokenExpired(): string {
    return jwt.sign(
      { id: 'expired_id' },
      process.env.JWT_ACCESS_SECRET as string,
      {
        expiresIn: '-1h'
      }
    )
  }

  /**
   * Create refresh token expired
   *
   * @returns {string}
   */
  static createRefreshTokenExpired(): string {
    return jwt.sign(
      { id: 'expired_id' },
      process.env.JWT_REFRESH_SECRET as string,
      {
        expiresIn: '-1h'
      }
    )
  }

  /**
   * Clean up data user auth and associated user auth data
   *
   * @returns {Promise<void>}
   */
  static async cleanUpDataUserAuthAndAssociatedUserAuthData(): Promise<void> {
    const emails = [
      'user_role_admin_test@example.com',
      'user_role_user_test@example.com',
      'user_role_user_test_2@example.com'
    ]

    await prisma.$transaction([
      prisma.apiKey.deleteMany({
        where: { user: { email: { in: emails } } }
      }),
      prisma.userToken.deleteMany({
        where: { user: { email: { in: emails } } }
      }),
      prisma.userRole.deleteMany({
        where: { user: { email: { in: emails } } }
      }),
      prisma.role.deleteMany({
        where: { name: { in: ['ADMIN', 'USER'] } }
      }),
      prisma.user.deleteMany({
        where: { email: { in: emails } }
      })
    ])
  }
}

export class TagTest {
  /**
   * Get 100 tags for test
   *
   * @returns {string[]} - Tags
   */
  private static getTags(): string[] {
    return Array.from({ length: 100 }, (_, i) => `Tag Test ${i + 1}`)
  }

  /**
   * Create tag data for test
   *
   * @returns {Promise<void>}
   */
  static async createTagTest(): Promise<void> {
    const roleAdmin = await AuthTest.upsertRole('ADMIN')
    const userRoleAdmin = await AuthTest.upsertUser(
      'user_role_admin_test@example.com',
      'User Role Admin Test',
      'user_role_admin_test',
      roleAdmin.id
    )
    const now = new Date()

    await prisma.$transaction(
      this.getTags().map((name, i) =>
        prisma.tag.create({
          data: {
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            created_by: userRoleAdmin.id,
            updated_by: userRoleAdmin.id,
            created_at: new Date(now.getTime() + i * 1000),
            updated_at: new Date(now.getTime() + i * 1000)
          }
        })
      )
    )
  }

  /**
   * Clean up tag data to avoid constraint error
   *
   * @returns {Promise<void>}
   */
  static async cleanUpDataTagAndAssociatedTagData(): Promise<void> {
    const tags = this.getTags()

    await prisma.$transaction([
      prisma.mealTag.deleteMany({
        where: { tag: { name: { in: tags } } }
      }),
      prisma.drinkTag.deleteMany({
        where: { tag: { name: { in: tags } } }
      }),
      prisma.tag.deleteMany({
        where: { name: { in: tags } }
      })
    ])
    await AuthTest.cleanUpDataAuthAndAssociatedAuthData()
  }

  /**
   * Clean up created or updated tag data to avoid constraint error
   *
   * @param {string | string[]} tags - Tag name or array of tag names
   * @returns {Promise<void>}
   */
  static async cleanUpDataTagCreatedOrUpdated(
    tags: string | string[]
  ): Promise<void> {
    const tagNames = Array.isArray(tags) ? tags : [tags]

    await prisma.$transaction([
      prisma.mealTag.deleteMany({
        where: { tag: { name: { in: tagNames } } }
      }),
      prisma.drinkTag.deleteMany({
        where: { tag: { name: { in: tagNames } } }
      }),
      prisma.tag.deleteMany({
        where: { name: { in: tagNames } }
      })
    ])
  }
}
