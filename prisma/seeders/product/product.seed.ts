import { prisma } from '@src/app/prisma'
import { UserRepository } from '@src/repositories/user/user.repository'

/**
 * Add products for starting seeder
 *
 * @returns {Promise<void>}
 */
export const addProductsForStartingSeeder = async (): Promise<void> => {
  const userRoleAdminId = await UserRepository.getUserWithRoleAdminId()
  const now = new Date()

  await prisma.$transaction(
    Array.from({ length: 100 }, (_, i) =>
      prisma.tag.create({
        data: {
          name: `Tag ${i + 1}`,
          slug: `tag-${i + 1}`,
          created_by: userRoleAdminId,
          updated_by: userRoleAdminId,
          created_at: new Date(now.getTime() + i),
          updated_at: new Date(now.getTime() + i)
        },
        select: { id: true }
      })
    )
  )
}
