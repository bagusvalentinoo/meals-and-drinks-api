import { prisma } from '@src/app/prisma'
import { UserRepository } from '@src/repositories/user/user.repository'

/**
 * Add API keys for starting seeder
 *
 * @returns {Promise<void>}
 */
export const addApiKeysForStartingSeeder = async (): Promise<void> => {
  const userAdminId = await UserRepository.getUserWithRoleAdminId()

  await prisma.$transaction([
    prisma.apiKey.create({
      data: {
        user_id: userAdminId,
        name: 'General API Key Test',
        slug: 'general-api-key-test',
        key: 'general_api_key_test',
        status: 'ACTIVE'
      }
    })
  ])
}
