import { Prisma } from '@prisma/client'
import { prisma } from '@app/prisma'
import type {
  MealIncludeCreatorUpdaterTagsAndCategories,
  GetMealsPayload,
  CreateMealPayload
} from '@type/model/meal.type'

export class MealRepository {
  /**
   * Get Meals and Count
   *
   * @param {GetMealsPayload} payload - Payload to get meals and count
   * @returns {Promise<{ meals: MealIncludeCreatorUpdaterTagsAndCategories[], count: number }>} - Meals and count
   */
  static async getAllAndCount(payload: GetMealsPayload): Promise<{
    meals: MealIncludeCreatorUpdaterTagsAndCategories[]
    count: number
  }> {
    const { filters, skip, take, order_by } = payload

    const meals = await prisma.meal.findMany({
      where: filters,
      skip,
      take,
      orderBy: order_by,
      include: {
        creator: {
          select: { id: true, name: true, photo_profile_url: true }
        },
        updater: {
          select: { id: true, name: true, photo_profile_url: true }
        },
        tags: {
          orderBy: { tag: { created_at: 'asc' } },
          include: { tag: { select: { id: true, name: true, slug: true } } }
        },
        categories: {
          orderBy: { category: { created_at: 'asc' } },
          include: {
            category: {
              select: { id: true, name: true, slug: true, photo_url: true }
            }
          }
        }
      }
    })
    const count = await prisma.meal.count({ where: filters })

    return { meals, count }
  }

  /**
   * Create Meal
   *
   * @param {CreateMealPayload} payload - Payload to create meal
   * @returns {Promise<MealIncludeCreatorUpdaterTagsAndCategories>} - Created meal
   */
  static async create(
    payload: CreateMealPayload
  ): Promise<MealIncludeCreatorUpdaterTagsAndCategories> {
    const {
      user_id,
      tag_ids,
      category_ids,
      name,
      slug,
      description,
      price,
      stock,
      status,
      path,
      url
    } = payload

    const now = new Date()
    const [meal] = await prisma.$transaction([
      prisma.meal.create({
        data: {
          name,
          slug,
          description,
          price: new Prisma.Decimal(price),
          stock,
          status,
          photo_path: path,
          photo_url: url,
          created_by: user_id,
          updated_by: user_id,
          created_at: new Date(now.getTime()),
          updated_at: new Date(now.getTime()),
          tags: {
            create: tag_ids.map((id) => ({
              tag: { connect: { id } }
            }))
          },
          categories: {
            create: category_ids.map((id) => ({
              category: { connect: { id } }
            }))
          }
        },
        include: {
          creator: {
            select: { id: true, name: true, photo_profile_url: true }
          },
          updater: {
            select: { id: true, name: true, photo_profile_url: true }
          },
          tags: {
            orderBy: { tag: { created_at: 'asc' } },
            include: { tag: { select: { id: true, name: true, slug: true } } }
          },
          categories: {
            orderBy: { category: { created_at: 'asc' } },
            include: {
              category: {
                select: { id: true, name: true, slug: true, photo_url: true }
              }
            }
          }
        }
      })
    ])

    return meal
  }

  /**
   * Find Meal by ID
   *
   * @param {string} id - Meal ID
   * @returns {Promise<string | null>} - Valid Meal ID or null
   */
  static async findById(id: string): Promise<string | null> {
    const meal = await prisma.meal.findUnique({
      where: { id },
      select: { id: true }
    })

    return meal ? meal.id : null
  }

  /**
   * Get valid slug from meal name
   *
   * @param {string} name - Meal name
   * @param {'create' | 'update'} purpose - Purpose of getting category slug
   * @returns {Promise<string>} - Valid slug
   */
  static async getSlugFromName(
    name: string,
    purpose: 'create' | 'update'
  ): Promise<string> {
    let slug = name.toLowerCase().replace(/\s+/g, '-')
    const count = await prisma.meal.count({ where: { name } })

    return count > 0 && purpose === 'create' ? `${slug}-${count}` : slug
  }

  /**
   * Get Meal by ID
   *
   * @param {string} id - Valid Meal ID
   * @returns {Promise<MealIncludeCreatorUpdaterTagsAndCategories>} - Meal
   */
  static async getById(
    id: string
  ): Promise<MealIncludeCreatorUpdaterTagsAndCategories> {
    const meal = await prisma.meal.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, photo_profile_url: true }
        },
        updater: {
          select: { id: true, name: true, photo_profile_url: true }
        },
        tags: {
          orderBy: { tag: { created_at: 'asc' } },
          include: { tag: { select: { id: true, name: true, slug: true } } }
        },
        categories: {
          orderBy: { category: { created_at: 'asc' } },
          include: {
            category: {
              select: { id: true, name: true, slug: true, photo_url: true }
            }
          }
        }
      }
    })

    return meal!
  }
}
