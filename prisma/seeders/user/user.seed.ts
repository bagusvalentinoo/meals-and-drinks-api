import { prisma } from '@src/app/prisma'
import bcrypt from 'bcrypt'
import { RoleRepository } from '@src/repositories/user/role.repository'

/**
 * Add users and their roles for starting seeder
 *
 * @returns {Promise<void>}
 */
export const addUsersAndTheirRolesForStartingSeeder =
  async (): Promise<void> => {
    const roleAdminId = await RoleRepository.getRoleAdminId()
    const roleUserId = await RoleRepository.getRoleUserId()

    await prisma.$transaction([
      prisma.user.create({
        data: {
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
      }),
      prisma.user.create({
        data: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          password: await bcrypt.hash('qwerty12345', 10),
          roles: {
            create: {
              role: {
                connect: { id: roleUserId }
              }
            }
          }
        }
      }),
      prisma.user.create({
        data: {
          name: 'Jane Doe',
          email: 'janedoe@example.com',
          password: await bcrypt.hash('qwerty12345', 10),
          roles: {
            create: {
              role: {
                connect: { id: roleUserId }
              }
            }
          }
        }
      }),
      prisma.user.create({
        data: {
          name: 'Thomas Doe',
          email: 'thomasdoe@example.com',
          password: await bcrypt.hash('qwerty12345', 10),
          roles: {
            create: {
              role: {
                connect: { id: roleUserId }
              }
            }
          }
        }
      })
    ])
  }
