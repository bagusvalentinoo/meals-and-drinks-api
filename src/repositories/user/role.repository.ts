import { prisma } from '@app/prisma'

export class RoleRepository {
  /**
   * Get role id
   *
   * @returns {Promise<string>} - Role id
   */
  static async getRoleAdminId(): Promise<string> {
    const [role] = await prisma.$transaction([
      prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: {
          name: 'ADMIN',
          created_at: new Date(),
          updated_at: new Date()
        },
        select: { id: true }
      })
    ])

    return role.id
  }

  /**
   * Get role id
   *
   * @returns {Promise<string>} - Role id
   */
  static async getRoleUserId(): Promise<string> {
    const [role] = await prisma.$transaction([
      prisma.role.upsert({
        where: { name: 'USER' },
        update: {},
        create: {
          name: 'USER',
          created_at: new Date(),
          updated_at: new Date()
        },
        select: { id: true }
      })
    ])

    return role.id
  }
}
