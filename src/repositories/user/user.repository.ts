import { prisma } from '@app/prisma'
import { RoleRepository } from '@repositories/user/role.repository'
import bcrypt from 'bcrypt'

export class UserRepository {
  /**
   * Get the ID of the role with the name 'ADMIN' and create a user with that role
   *
   * @returns {Promise<string>} The ID of the user with the role 'ADMIN'
   */
  static async getUserWithRoleAdminId(): Promise<string> {
    const roleAdminId = await RoleRepository.getRoleAdminId()

    const [user] = await prisma.$transaction([
      prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
          name: 'Admin',
          email: 'admin@example.com',
          password: await bcrypt.hash('qwerty12345', 10),
          roles: {
            create: {
              role: {
                connect: { id: roleAdminId }
              }
            }
          }
        }
      })
    ])

    return user.id
  }
}
