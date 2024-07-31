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
  private static async upsertRole(name: string): Promise<{ id: string }> {
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
  private static async upsertUser(
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
  static async cleanUpDataUserAuthAndAssociatedAssociatedUserAuthData(): Promise<void> {
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
