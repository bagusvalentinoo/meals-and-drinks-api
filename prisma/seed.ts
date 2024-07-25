import { prisma } from '@src/app/prisma'
import { addUsersAndTheirRolesForStartingSeeder } from '@seeders/user/user.seed'
import { addApiKeysForStartingSeeder } from '@seeders/other/api_key.seed'

async function main() {
  await addUsersAndTheirRolesForStartingSeeder()
  await addApiKeysForStartingSeeder()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
