import { prisma } from '@app/prisma'
import type { PaginationRequest } from '@type/model/page.type'
import type {
  TagResponse,
  TagIncludeCreatorUpdaterAndCount,
  GetTagsResponse,
  CreateTagRequest,
  CreateTagResponse,
  UpdateTagRequest,
  UpdateTagResponse,
  DeleteBatchTagsRequest
} from '@type/model/tag.type'
import { Validation } from '@validations/validation'
import { TagValidation } from '@validations/admin/tag.validation'
import { PageValidation } from '@validations/other/page.validation'
import { paginate } from '@utils/http/response.util'
import { FormattedResponseError } from '@utils/error/formatted_response_error.util'

export class TagService {
  /**
   * Convert tag object to response object
   *
   * @param {TagIncludeCreatorUpdaterAndCount} tag - Tag object
   * @param {(keyof TagResponse)[]} [fields=[]] - Fields to be included in response
   * @returns {Partial<TagResponse>} - Response object that contains tag data
   */
  private static toTagResponse(
    tag: TagIncludeCreatorUpdaterAndCount,
    fields: (keyof TagResponse)[] = []
  ): Partial<TagResponse> {
    const response: Partial<TagResponse> = {}

    if (fields.length === 0 || fields.includes('id')) response.id = tag.id
    if (fields.length === 0 || fields.includes('name')) response.name = tag.name
    if (fields.length === 0 || fields.includes('slug')) response.slug = tag.slug
    if (fields.length === 0 || (fields.includes('meals_count') && tag._count))
      response.meals_count = tag._count!.meals
    if (fields.length === 0 || (fields.includes('drinks_count') && tag._count))
      response.drinks_count = tag._count!.drinks
    if (
      fields.length === 0 ||
      (fields.includes('created_at') && tag.created_at)
    )
      response.created_at = tag.created_at
    if (
      fields.length === 0 ||
      (fields.includes('updated_at') && tag.updated_at)
    )
      response.updated_at = tag.updated_at
    if (fields.length === 0 || (fields.includes('creator') && tag.creator))
      response.creator = tag.creator
    if (fields.length === 0 || (fields.includes('updater') && tag.updater))
      response.updater = tag.updater

    return response
  }

  /**
   * Get valid slug from tag name
   *
   * @param {string} name - Tag name
   * @param {'create' | 'update'} purpose - Purpose of getting tag slug
   * @returns {Promise<string>} - Valid tag slug
   */
  private static async getTagSlugFromName(
    name: string,
    purpose: 'create' | 'update'
  ): Promise<string> {
    let slug = name.toLowerCase().replace(/\s+/g, '-')
    const count = await prisma.tag.count({ where: { slug } })

    return count > 0 && purpose === 'create' ? `${slug}-${count}` : slug
  }

  /**
   * Get all tags with pagination
   *
   * @param {PaginationRequest} req - Request object {query: PaginationRequest}
   * @returns {Promise<GetTagsResponse>} - Response object that contains tags and pagination
   */
  static async getTags(req: PaginationRequest): Promise<GetTagsResponse> {
    const { page, size, order_by, order_dir, search } = Validation.validate(
      PageValidation.PAGINATION,
      req
    )

    const orderDir = order_dir?.toLowerCase() || 'desc'
    let orderBy: any = { updated_at: orderDir }

    if (order_by === 'name') {
      orderBy = { name: orderDir }
    } else if (order_by === 'slug') {
      orderBy = { slug: orderDir }
    }

    const filters: any = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {}

    const tags = await prisma.tag.findMany({
      where: filters,
      skip: (page - 1) * size,
      take: size,
      orderBy,
      include: {
        creator: {
          select: { id: true, name: true, photo_profile_url: true }
        },
        updater: {
          select: { id: true, name: true, photo_profile_url: true }
        },
        _count: { select: { meals: true, drinks: true } }
      }
    })

    const tagsCount = await prisma.tag.count({
      where: filters
    })

    if (order_by === 'meals_count') {
      tags.sort((a, b) =>
        orderDir === 'asc'
          ? a._count.meals - b._count.meals
          : b._count.meals - a._count.meals
      )
    } else if (order_by === 'drinks_count') {
      tags.sort((a, b) =>
        orderDir === 'asc'
          ? a._count.drinks - b._count.drinks
          : b._count.drinks - a._count.drinks
      )
    }

    return {
      tags: tags.map((tag) => this.toTagResponse(tag) as TagResponse),
      pagination: paginate(tagsCount, page, size)
    }
  }

  /**
   * Create single tag or batch tags
   *
   * @param {string} userId - User ID
   * @param {CreateTagRequest} req - Request object {body: CreateTagRequest}
   * @returns {Promise<CreateTagResponse[]>} - Response object that contains array of created tags
   */
  static async createTags(
    userId: string,
    req: CreateTagRequest
  ): Promise<CreateTagResponse[]> {
    const { names } = Validation.validate(TagValidation.CREATE, req)
    const tagNames = Array.isArray(names) ? names : [names]

    const now = new Date()
    const tags = await prisma.$transaction(async (tx) => {
      return await Promise.all(
        tagNames.map(async (name, i) => {
          const slug = await this.getTagSlugFromName(name, 'create')
          const date = new Date(now.getTime() + i)
          return tx.tag.create({
            data: {
              name,
              slug,
              created_by: userId,
              updated_by: userId,
              created_at: date,
              updated_at: date
            },
            include: {
              creator: {
                select: { id: true, name: true, photo_profile_url: true }
              },
              updater: {
                select: { id: true, name: true, photo_profile_url: true }
              }
            }
          })
        })
      )
    })

    return tags.map(
      (tag) =>
        this.toTagResponse(tag, [
          'id',
          'name',
          'slug',
          'creator',
          'updater'
        ]) as CreateTagResponse
    )
  }

  /**
   * Find tag and return valid tag ID
   *
   * @param {string} id - Tag ID
   * @returns {Promise<string>} - Tag ID
   */
  static async findTagById(id: string): Promise<string> {
    const validId = Validation.validate(TagValidation.FIND, id)

    const tag = await prisma.tag.findUnique({
      where: { id: validId },
      select: { id: true }
    })

    if (!tag) throw new FormattedResponseError(400, 'Oops, tag not found')

    return tag.id
  }

  /**
   * Get single tag
   *
   * @param {string} id - Valid tag ID
   */
  static async getTag(id: string) {
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, photo_profile_url: true }
        },
        updater: {
          select: { id: true, name: true, photo_profile_url: true }
        },
        _count: { select: { meals: true, drinks: true } }
      }
    })

    return this.toTagResponse(tag!) as TagResponse
  }

  /**
   * Update single tag
   *
   * @param {string} tagId - Valid tag ID
   * @param {string} userId - User ID
   * @param {UpdateTagRequest} req - Request object {body: UpdateTagRequest}
   * @returns {Promise<UpdateTagResponse>} - Response object that contains updated tag
   */
  static async updateTag(
    tagId: string,
    userId: string,
    req: UpdateTagRequest
  ): Promise<UpdateTagResponse> {
    const { name } = Validation.validate(TagValidation.UPDATE, req)
    const slug = await this.getTagSlugFromName(name, 'update')

    const now = new Date()
    const [tag] = await prisma.$transaction([
      prisma.tag.update({
        where: { id: tagId },
        data: {
          name,
          slug,
          updated_at: new Date(now.getTime() + 1000),
          updated_by: userId
        },
        include: {
          creator: {
            select: { id: true, name: true, photo_profile_url: true }
          },
          updater: {
            select: { id: true, name: true, photo_profile_url: true }
          },
          _count: { select: { meals: true, drinks: true } }
        }
      })
    ])

    return this.toTagResponse(tag, [
      'id',
      'name',
      'slug',
      'meals_count',
      'drinks_count',
      'creator',
      'updater'
    ]) as UpdateTagResponse
  }

  /**
   * Delete single tag
   *
   * @param {string} id - Valid tag ID
   * @returns {Promise<void>}
   */
  static async deleteSingleTag(id: string): Promise<void> {
    await prisma.$transaction([
      prisma.mealTag.deleteMany({ where: { tag_id: id } }),
      prisma.drinkTag.deleteMany({ where: { tag_id: id } }),
      prisma.tag.delete({ where: { id } })
    ])
  }

  /**
   * Delete batch tags
   *
   * @param {DeleteBatchTagsRequest} req - Request object {body: DeleteBatchTagsRequest}
   * @returns {Promise<number>} - Number of deleted tags
   */
  static async deleteBatchTags(req: DeleteBatchTagsRequest): Promise<number> {
    const { ids } = Validation.validate(TagValidation.DELETE_BATCH, req)

    const [, , { count }] = await prisma.$transaction([
      prisma.mealTag.deleteMany({ where: { tag_id: { in: ids } } }),
      prisma.drinkTag.deleteMany({ where: { tag_id: { in: ids } } }),
      prisma.tag.deleteMany({ where: { id: { in: ids } } })
    ])

    return count
  }
}
