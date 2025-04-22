import { Prisma } from '@prisma/client'
import type {
  MealIncludeCreatorUpdaterTagsAndCategories,
  MealResponse,
  GetMealsRequest,
  GetMealsResponse,
  CreateMealRequest,
  CreateMealResponse,
  CreateMealPayload
} from '@type/model/meal.type'
import type { FileRequest } from '@type/model/file.type'
import { Validation } from '@validations/validation'
import { MealValidation } from '@validations/admin/meal.validation'
import { TagRepository } from '@repositories/product/tag.repository'
import { MealRepository } from '@repositories/product/meal.repository'
import { paginate } from '@utils/http/response.util'
import { validateFile } from '@utils/file/file.util'
import { imageAllowMimeTypes } from '@constants/file/file'
import { FormattedResponseError } from '@utils/error/formatted_response_error.util'

export class MealService {
  /**
   * Convert Meal Object to Response Object
   *
   * @param {MealIncludeCreatorUpdaterTagsAndCategories} meal - Meal object
   * @param {Array<keyof MealResponse>} fields - Fields to be included in the response
   * @returns {Partial<MealResponse>} - Response object that contains meal data
   */
  private static toMealResponse(
    meal: MealIncludeCreatorUpdaterTagsAndCategories,
    fields: (keyof MealResponse)[] = []
  ): Partial<MealResponse> {
    const response: Partial<MealResponse> = {}

    if (fields.length === 0 || fields.includes('id')) response.id = meal.id
    if (fields.length === 0 || fields.includes('name'))
      response.name = meal.name
    if (fields.length === 0 || fields.includes('slug'))
      response.slug = meal.slug
    if (fields.length === 0 || fields.includes('description'))
      response.description = meal.description
    if (fields.length === 0 || fields.includes('price'))
      response.price = Number(meal.price)
    if (fields.length === 0 || fields.includes('price_usd'))
      response.price_usd = `$${meal.price}`
    if (fields.length === 0 || fields.includes('stock'))
      response.stock = meal.stock
    if (fields.length === 0 || fields.includes('status'))
      response.status = meal.status
    if (fields.length === 0 || fields.includes('rating'))
      response.rating = meal.rating
    if (fields.length === 0 || fields.includes('rating_status'))
      response.rating_status = meal.rating > 0 ? 'RATED' : 'NOT_RATED'
    if (fields.length === 0 || fields.includes('photo_url'))
      response.photo_url = meal.photo_url
    if (fields.length === 0 || fields.includes('tags'))
      response.tags = meal.tags.map((mealTag) => mealTag.tag.name)
    if (fields.length === 0 || fields.includes('categories'))
      response.categories = meal.categories.map(
        (mealCategory) => mealCategory.category.name
      )
    if (fields.length === 0 || fields.includes('creator'))
      response.creator = meal.creator
    if (fields.length === 0 || fields.includes('updater'))
      response.updater = meal.updater
    if (fields.length === 0 || fields.includes('created_at'))
      response.created_at = meal.created_at
    if (fields.length === 0 || fields.includes('updated_at'))
      response.updated_at = meal.updated_at

    return response
  }

  /**
   * Get all Meals
   *
   * @param {GetMealsRequest} req - Request object {query: GetMealsRequest}
   * @returns {Promise<GetMealsResponse>} - Response object that contains meals data
   */
  static async getMeals(req: GetMealsRequest): Promise<GetMealsResponse> {
    const { page, size, order_by, order_dir, search, status } =
      Validation.validate(MealValidation.GET_ALL, req)

    const orderDir: 'asc' | 'desc' =
      (order_dir?.toLowerCase() as 'asc' | 'desc') || 'desc'
    const orderBy: Record<string, 'asc' | 'desc'> = {
      [order_by || 'updated_at']: orderDir
    }

    const searchFilters: Prisma.MealWhereInput[] = []
    if (search) {
      searchFilters.push(
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      )
      const searchNumber = Number(search)
      if (!isNaN(searchNumber)) {
        searchFilters.push(
          { price: { equals: searchNumber } },
          { stock: { equals: searchNumber } }
        )
      }
    }

    const filters: Prisma.MealWhereInput = {
      ...(searchFilters.length > 0 && { OR: searchFilters }),
      ...(status && { status })
    }

    const { meals, count } = await MealRepository.getAllAndCount({
      filters,
      skip: (page - 1) * size,
      take: size,
      order_by: orderBy
    })

    return {
      meals: meals.map((meal) => this.toMealResponse(meal) as MealResponse),
      pagination: paginate(count, page, size)
    }
  }

  /**
   * Create Meal
   *
   * @param {string} userId - User ID
   * @param {FileRequest} file - Request object {file: FileRequest}
   * @param {CreateMealRequest} req - Request object {body: CreateMealRequest}
   * @returns {Promise<CreateMealResponse>} - Response object that contains meal data
   */
  static async createMeal(
    userId: string,
    file: FileRequest,
    req: CreateMealRequest
  ): Promise<CreateMealResponse> {
    const {
      tag_ids,
      tag_names,
      category_ids,
      name,
      description,
      price,
      stock,
      status
    } = Validation.validate(MealValidation.CREATE, req)
    const { path, url } = file

    if (!path || !url)
      throw new FormattedResponseError(400, "Oops, meal photo can't be empty")

    await validateFile(path, imageAllowMimeTypes)

    const tagIds = tag_ids ? (Array.isArray(tag_ids) ? tag_ids : [tag_ids]) : []
    const categoryIds = category_ids
      ? Array.isArray(category_ids)
        ? category_ids
        : [category_ids]
      : []

    if (tag_names) {
      const tagNames = Array.isArray(tag_names) ? tag_names : [tag_names]
      const tags = await TagRepository.upsertTags({
        user_id: userId,
        names: tagNames
      })

      tagIds.push(...tags.map((tag) => tag.id))
    }

    const record: CreateMealPayload = {
      user_id: userId,
      tag_ids: tagIds,
      category_ids: categoryIds,
      name,
      description,
      price,
      stock,
      status,
      path,
      url
    } as CreateMealPayload

    if (stock === 0 && status !== 'OUT_OF_STOCK') {
      record.status = 'OUT_OF_STOCK'
    } else if (stock > 0 && status !== 'AVAILABLE') {
      record.status = 'AVAILABLE'
    }

    const slug = await MealRepository.getSlugFromName(name, 'create')
    const meal = await MealRepository.create({ ...record, ...{ slug } })

    return this.toMealResponse(meal, [
      'id',
      'name',
      'slug',
      'description',
      'price',
      'price_usd',
      'stock',
      'status',
      'rating',
      'rating_status',
      'photo_url',
      'creator',
      'updater',
      'tags',
      'categories'
    ]) as CreateMealResponse
  }

  /**
   * Find Meal by ID
   *
   * @param {string} id - Meal ID
   * @returns {Promise<string>} - Valid Meal ID
   */
  static async findMealById(id: string): Promise<string> {
    const validId = Validation.validate(MealValidation.FIND_BY_ID, id)
    const mealId = await MealRepository.findById(validId)

    if (!mealId) throw new FormattedResponseError(400, 'Oops, meal not found')

    return mealId
  }

  /**
   * Get Single Meal
   *
   * @param {string} id - Meal ID
   * @returns {Promise<MealResponse>} - Response object that contains meal data
   */
  static async getMeal(id: string): Promise<MealResponse> {
    const mealId = await this.findMealById(id)
    const meal = await MealRepository.getById(mealId)

    return this.toMealResponse(meal) as MealResponse
  }
}
