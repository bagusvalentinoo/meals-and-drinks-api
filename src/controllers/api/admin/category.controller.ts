import type { Response, NextFunction } from 'express'
import type { UserRequest } from '@type/http/user_request.type'
import type { UserUploadRequest } from '@type/http/user_upload_request.type'
import type { PaginationRequest } from '@type/model/page.type'
import type {
  CreateOrUpdateCategoryRequest,
  DeleteBatchCategoriesRequest
} from '@type/model/category.type'
import type { FileRequest } from '@type/model/file.type'
import { CategoryService } from '@services/admin/category.service'
import { deleteFile } from '@utils/file/file.util'
import { responseSuccess } from '@utils/http/response.util'

export class CategoryController {
  /**
   * Get all categories with pagination
   *
   * @param {UserRequest} req - Request object {query: PaginationRequest}
   * @param {Response} res - Response object
   * @param {NextFunction} next - Next function
   */
  static async index(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const request: PaginationRequest = {
        page: req.query.page ? Number(req.query.page) : 1,
        size: req.query.size ? Number(req.query.size) : 10,
        order_by: req.query.order_by as string,
        order_dir: req.query.order_dir as string,
        search: req.query.search as string
      }
      const categories = await CategoryService.getCategories(request)

      return responseSuccess(
        res,
        200,
        'Hooray, successfully get all categories',
        categories
      )
    } catch (error) {
      next(error)
    }

    return null
  }

  /**
   * Create category
   *
   * @param {UserUploadRequest} req - Request object {body: CreateOrUpdateCategoryRequest, file: Express.Multer.File}
   * @param {Response} res - Response object
   * @param {NextFunction} next - Next function
   */
  static async store(
    req: UserUploadRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const request: CreateOrUpdateCategoryRequest =
        req.body as CreateOrUpdateCategoryRequest
      const file = { path: req.file_path!, url: req.file_url! }
      const category = await CategoryService.createCategory(
        req.user_id!,
        file,
        request
      )

      return responseSuccess(
        res,
        201,
        'Hooray, successfully create category',
        category,
        'category'
      )
    } catch (error) {
      if (req.file_path) deleteFile(req.file_path)
      next(error)
    }

    return null
  }

  /**
   * Get single category
   *
   * @param {UserRequest} req - Request object {params: {id: string}}
   * @param {Response} res - Response object
   * @param {NextFunction} next - Next function
   */
  static async show(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.getCategory(req.params.id)

      return responseSuccess(
        res,
        200,
        'Hooray, successfully get category',
        category,
        'category'
      )
    } catch (error) {
      next(error)
    }

    return null
  }

  /**
   * Update category
   *
   * @param {UserUploadRequest} req - Request object {params: {id: string}, body: CreateOrUpdateCategoryRequest, file: Express.Multer.File}
   * @param {Response} res - Response object
   * @param {NextFunction} next - Next function
   */
  static async update(
    req: UserUploadRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const request: CreateOrUpdateCategoryRequest =
        req.body as CreateOrUpdateCategoryRequest
      const file: FileRequest = { path: req.file_path!, url: req.file_url! }
      const category = await CategoryService.updateCategory(
        req.params.id,
        req.user_id!,
        file,
        request
      )

      return responseSuccess(
        res,
        200,
        'Hooray, successfully update category',
        category,
        'category'
      )
    } catch (error) {
      if (req.file_path) deleteFile(req.file_path)
      next(error)
    }

    return null
  }

  /**
   * Delete single category
   *
   * @param {UserRequest} req - Request object {params: {id: string}}
   * @param {Response} res - Response object
   * @param {NextFunction} next - Next function
   */
  static async destroySingle(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      await CategoryService.deleteSingleCategory(req.params.id)

      return responseSuccess(res, 200, 'Hooray, successfully delete category')
    } catch (error) {
      next(error)
    }

    return null
  }

  /**
   * Delete batch categories
   *
   * @param {UserRequest} req - Request object {body: DeleteBatchCategoriesRequest}
   * @param {Response} res - Response object
   * @param {NextFunction} next - Next function
   */
  static async destroyBatch(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const request: DeleteBatchCategoriesRequest =
        req.body as DeleteBatchCategoriesRequest
      const deletedCategoriesCount =
        await CategoryService.deleteBatchCategories(request)

      return responseSuccess(
        res,
        200,
        `Hooray, successfully delete ${deletedCategoriesCount} categories`
      )
    } catch (error) {
      next(error)
    }

    return null
  }
}
