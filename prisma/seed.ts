import { prisma } from '@src/app/prisma'
import { addUsersAndTheirRolesForStartingSeeder } from '@seeders/user/user.seed'
import { addApiKeysForStartingSeeder } from '@seeders/other/api_key.seed'
import { addProductsForStartingSeeder } from '@seeders/product/product.seed'

async function main() {
  await addUsersAndTheirRolesForStartingSeeder()
  await addApiKeysForStartingSeeder()
  await addProductsForStartingSeeder()
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
