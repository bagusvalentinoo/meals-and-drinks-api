import { prisma } from '@app/prisma'

/**
 * Clean up expired token
 *
 * @returns {Promise<void>}
 */
export const cleanUpExpiredToken = async (): Promise<void> => {
  try {
    const [deletedRows] = await prisma.$transaction([
      prisma.userToken.deleteMany({
        where: { expired_at: { lte: new Date() } }
      })
    ])

    console.debug(
      `${new Date()} - Deleted ${deletedRows.count} expired token(s)`
    )
  } catch (e) {
    console.error('Error cleaning up expired token: ', e)
  }
}
