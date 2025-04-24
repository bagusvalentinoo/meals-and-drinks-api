import { prisma } from '@app/prisma'

export class CategoryRepository {
  /**
   * Get valid slug from category name
   *
   * @param {string} name - Category name
   * @param {'create' | 'update'} purpose - Purpose of getting category slug
   * @returns {Promise<string>} - Valid slug
   */
  static async getCategorySlugFromCategoryName(
    name: string,
    purpose: 'create' | 'update'
  ): Promise<string> {
    let slug = name.toLowerCase().replace(/\s+/g, '-')
    const count = await prisma.category.count({ where: { name } })

    return count > 0 && purpose === 'create' ? `${slug}-${count}` : slug
  }
}
