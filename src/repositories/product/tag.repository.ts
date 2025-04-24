import type { Tag } from '@prisma/client'
import { prisma } from '@app/prisma'
import type { CreateTagPayload } from '@type/model/tag.type'

export class TagRepository {
  /**
   * Get valid slug from tag name
   *
   * @param {string} name - Tag name
   * @param {'create' | 'update'} purpose - Purpose of getting tag slug
   * @returns {Promise<string>} - Valid tag slug
   */
  static async getTagSlugFromTagName(
    name: string,
    purpose: 'create' | 'update'
  ): Promise<string> {
    let slug = name.toLowerCase().replace(/\s+/g, '-')
    const count = await prisma.tag.count({ where: { name } })

    return count > 0 && purpose === 'create' ? `${slug}-${count}` : slug
  }

  /**
   * Upsert tags
   *
   * @param {CreateTagPayload} payload - Request object
   * @returns {Promise<Tag[]>} - Array of tag objects
   */
  static async upsertTags(payload: CreateTagPayload): Promise<Tag[]> {
    const tagNames = Array.isArray(payload.names)
      ? payload.names
      : [payload.names]

    const now = new Date()
    return prisma.$transaction(async (tx) => {
      return Promise.all(
        tagNames.map(async (name, i) => {
          const slug = await TagRepository.getTagSlugFromTagName(name, 'create')
          const date = new Date(now.getTime() + i)
          return tx.tag.upsert({
            where: { name },
            update: {},
            create: {
              name,
              slug,
              created_by: payload.user_id,
              updated_by: payload.user_id,
              created_at: date,
              updated_at: date
            }
          })
        })
      )
    })
  }
}
