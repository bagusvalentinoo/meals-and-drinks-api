import { prisma } from '@app/prisma'
import type { PaginationRequest } from '@type/model/page.type'
import type {
  CategoryResponse,
  CategoryIncludeCreatorUpdaterAndCount,
  GetCategoriesResponse,
  CreateOrUpdateCategoryRequest,
  CreateCategoryResponse,
  UpdateCategoryResponse,
  DeleteBatchCategoriesRequest
} from '@type/model/category.type'
import type { FileRequest } from '@type/model/file.type'
import { Validation } from '@validations/validation'
import { PageValidation } from '@validations/other/page.validation'
import { CategoryValidation } from '@validations/admin/category.validation'
// import { FileValidation } from '@validations/other/file.validation'
import { paginate } from '@utils/http/response.util'
import { validateFile, deleteFile } from '@utils/file/file.util'
import { FormattedResponseError } from '@utils/error/formatted_response_error.util'

export class CategoryService {
  /**
   * Convert category object to response object
   *
   * @param {CategoryIncludeCreatorUpdaterAndCount} category - Category object
   * @param {(keyof CategoryResponse)[]} [fields=[]] - Fields to be included in response
   * @returns {Partial<CategoryResponse>} - Response object that contains category data
   */
  private static toCategoryResponse(
    category: CategoryIncludeCreatorUpdaterAndCount,
    fields: (keyof CategoryResponse)[] = []
  ): Partial<CategoryResponse> {
    const response: Partial<CategoryResponse> = {}

    if (fields.length === 0 || fields.includes('id')) response.id = category.id
    if (fields.length === 0 || fields.includes('name'))
      response.name = category.name
    if (fields.length === 0 || fields.includes('slug'))
      response.slug = category.slug
    if (fields.length === 0 || fields.includes('photo_url'))
      response.photo_url = category.photo_url
    if (
      fields.length === 0 ||
      (fields.includes('meals_count') && category._count)
    )
      response.meals_count = category._count!.meals
    if (
      fields.length === 0 ||
      (fields.includes('drinks_count') && category._count)
    )
      response.drinks_count = category._count!.drinks
    if (
      fields.length === 0 ||
      (fields.includes('created_at') && category.created_at)
    )
      response.created_at = category.created_at
    if (
      fields.length === 0 ||
      (fields.includes('updated_at') && category.updated_at)
    )
      response.updated_at = category.updated_at
    if (fields.length === 0 || (fields.includes('creator') && category.creator))
      response.creator = category.creator
    if (fields.length === 0 || (fields.includes('updater') && category.updater))
      response.updater = category.updater

    return response
  }

  /**
   * Get valid slug from category name
   *
   * @param {string} name - Category name
   * @param {'create' | 'update'} purpose - Purpose of getting category slug
   * @returns {Promise<string>} - Valid slug
   */
  private static async getCategorySlugFromName(
    name: string,
    purpose: 'create' | 'update'
  ): Promise<string> {
    let slug = name.toLowerCase().replace(/\s+/g, '-')
    const count = await prisma.category.count({ where: { slug } })

    return count > 0 && purpose === 'create' ? `${slug}-${count}` : slug
  }

  /**
   * Get all categories with pagination
   *
   * @param {PaginationRequest} req - Request object {query: PaginationRequest}
   * @returns {Promise<GetCategoriesResponse>} - Response object that contains categories and pagination
   */
  static async getCategories(
    req: PaginationRequest
  ): Promise<GetCategoriesResponse> {
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

    const categories = await prisma.category.findMany({
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
        _count: {
          select: { meals: true, drinks: true }
        }
      }
    })

    const categoriesCount = await prisma.category.count({ where: filters })

    if (order_by === 'meals_count') {
      categories.sort((a, b) =>
        orderDir === 'asc'
          ? a._count.meals - b._count.meals
          : b._count.meals - a._count.meals
      )
    } else if (order_by === 'drinks_count') {
      categories.sort((a, b) =>
        orderDir === 'asc'
          ? a._count.drinks - b._count.drinks
          : b._count.drinks - a._count.drinks
      )
    }

    return {
      categories: categories.map(
        (category) => this.toCategoryResponse(category) as CategoryResponse
      ),
      pagination: paginate(categoriesCount, page, size)
    }
  }

  /**
   * Create category
   *
   * @param {string} userId - User ID
   * @param {FileRequest} file - Request object {file: FileRequest}
   * @param {CreateOrUpdateCategoryRequest} req - Request object {body: CreateOrUpdateCategoryRequest}
   * @returns {Promise<CreateCategoryResponse>} - Response object that contains category data
   */
  static async createCategory(
    userId: string,
    file: FileRequest,
    req: CreateOrUpdateCategoryRequest
  ): Promise<CreateCategoryResponse> {
    const { name } = Validation.validate(CategoryValidation.CREATE_UPDATE, req)
    const { path, url } = file

    if (!path || !url)
      throw new FormattedResponseError(
        400,
        "Oops, category photo can't be empty"
      )

    await validateFile(path, ['image/png', 'image/jpg', 'image/jpeg'])

    const now = new Date()
    const slug = await this.getCategorySlugFromName(name, 'create')
    const [category] = await prisma.$transaction([
      prisma.category.create({
        data: {
          name,
          slug,
          photo_path: path,
          photo_url: url,
          created_by: userId,
          updated_by: userId,
          created_at: new Date(now.getTime()),
          updated_at: new Date(now.getTime())
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
    ])

    return this.toCategoryResponse(category, [
      'id',
      'name',
      'slug',
      'photo_url',
      'creator',
      'updater'
    ]) as CreateCategoryResponse
  }

  /**
   * Find category and return valid category ID
   *
   * @param {string} id - Category ID
   * @returns {Promise<string>} - Valid category ID
   */
  private static async findCategoryById(id: string): Promise<string> {
    const validId = Validation.validate(CategoryValidation.FIND, id)

    const category = await prisma.category.findUnique({
      where: { id: validId },
      select: { id: true }
    })

    if (!category)
      throw new FormattedResponseError(400, 'Oops, category not found')

    return category.id
  }

  /**
   * Get single category
   *
   * @param {string} id - Valid category ID
   * @returns {Promise<CategoryResponse>} - Response object that contains category data
   */
  static async getCategory(id: string): Promise<CategoryResponse> {
    const categoryId = await this.findCategoryById(id)

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        creator: {
          select: { id: true, name: true, photo_profile_url: true }
        },
        updater: {
          select: { id: true, name: true, photo_profile_url: true }
        },
        _count: {
          select: { meals: true, drinks: true }
        }
      }
    })

    return this.toCategoryResponse(category!) as CategoryResponse
  }

  /**
   * Update category
   *
   * @param {string} categoryId - Category ID
   * @param {string} userId - User ID
   * @param {FileRequest} file - Request object {file: FileRequest}
   * @param {CreateOrUpdateCategoryRequest} req - Request object {body: CreateOrUpdateCategoryRequest}
   * @returns {Promise<UpdateCategoryResponse>} - Response object that contains category data
   */
  static async updateCategory(
    categoryId: string,
    userId: string,
    file: FileRequest,
    req: CreateOrUpdateCategoryRequest
  ): Promise<UpdateCategoryResponse> {
    const validCategoryId = await this.findCategoryById(categoryId)

    const { name } = Validation.validate(CategoryValidation.CREATE_UPDATE, req)
    const { path, url } = file

    if (path) await validateFile(path, ['image/png', 'image/jpg', 'image/jpeg'])

    const category = await prisma.category.findUnique({
      where: { id: validCategoryId },
      select: { photo_path: true, photo_url: true }
    })

    if (path && category!.photo_path) deleteFile(category!.photo_path)

    const now = new Date()
    const slug = await this.getCategorySlugFromName(name, 'update')
    const [updatedCategory] = await prisma.$transaction([
      prisma.category.update({
        where: { id: validCategoryId },
        data: {
          name,
          slug,
          photo_path: path || category!.photo_path,
          photo_url: url || category!.photo_url,
          updated_by: userId,
          updated_at: new Date(now.getTime())
        },
        include: {
          creator: {
            select: { id: true, name: true, photo_profile_url: true }
          },
          updater: {
            select: { id: true, name: true, photo_profile_url: true }
          },
          _count: {
            select: { meals: true, drinks: true }
          }
        }
      })
    ])

    return this.toCategoryResponse(updatedCategory, [
      'id',
      'name',
      'slug',
      'photo_url',
      'meals_count',
      'drinks_count',
      'creator',
      'updater'
    ]) as UpdateCategoryResponse
  }

  /**
   * Delete single category
   *
   * @param {string} id - Category ID
   * @returns {Promise<void>}
   */
  static async deleteSingleCategory(id: string): Promise<void> {
    const categoryId = await this.findCategoryById(id)

    const [, , deletedCategory] = await prisma.$transaction([
      prisma.mealCategory.deleteMany({ where: { category_id: categoryId } }),
      prisma.drinkCategory.deleteMany({ where: { category_id: categoryId } }),
      prisma.category.delete({
        where: { id: categoryId },
        select: { photo_path: true }
      })
    ])

    if (deletedCategory.photo_path) deleteFile(deletedCategory.photo_path)
  }

  /**
   * Delete batch categories
   *
   * @param {DeleteBatchCategoriesRequest} req - Request object {body: DeleteBatchCategoriesRequest}
   * @returns {Promise<number>} - Number of deleted categories
   */
  static async deleteBatchCategories(
    req: DeleteBatchCategoriesRequest
  ): Promise<number> {
    const { ids } = Validation.validate(CategoryValidation.DELETE_BATCH, req)

    const categories = await prisma.category.findMany({
      where: { id: { in: ids } },
      select: { photo_path: true }
    })

    if (categories.length > 0)
      categories.forEach((category) => {
        if (category.photo_path) deleteFile(category.photo_path)
      })

    const [, , { count }] = await prisma.$transaction([
      prisma.mealCategory.deleteMany({ where: { category_id: { in: ids } } }),
      prisma.drinkCategory.deleteMany({ where: { category_id: { in: ids } } }),
      prisma.category.deleteMany({ where: { id: { in: ids } } })
    ])

    return count
  }
}
