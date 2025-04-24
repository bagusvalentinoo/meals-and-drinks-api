import type { Response, NextFunction } from 'express'
import type { UserRequest } from '@type/http/user_request.type'
import type { UserUploadRequest } from '@type/http/user_upload_request.type'
import type { GetMealsRequest, CreateMealRequest } from '@type/model/meal.type'
import type { FileRequest } from '@type/model/file.type'
import { MealService } from '@services/admin/meal.service'
import { deleteFile } from '@utils/file/file.util'
import { responseSuccess } from '@utils/http/response.util'

export class MealController {
  /**
   * Get all meals with pagination
   *
   * @param {UserRequest} req - Request object {query: GetMealsRequest}
   * @param {Response} res - Response object
   * @param {NextFunction} next - Next function
   */
  static async index(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const request: GetMealsRequest = {
        page: req.query.page ? Number(req.query.page) : 1,
        size: req.query.size ? Number(req.query.size) : 10,
        order_by: req.query.order_by as string,
        order_dir: req.query.order_dir as string,
        search: req.query.search as string,
        status: req.query.status as 'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN'
      } as GetMealsRequest
      const meals = await MealService.getMeals(request)

      return responseSuccess(
        res,
        200,
        'Hooray, successfully get all meals',
        meals
      )
    } catch (error) {
      next(error)
    }

    return null
  }

  /**
   * Create Meal
   *
   * @param {UserUploadRequest} req - Request object - {body: CreateMealRequest, file: Express.Multer.File}
   * @param {Response} res - Response object
   * @param {NextFunction} next - Next function
   */
  static async store(
    req: UserUploadRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const request: CreateMealRequest = {
        ...req.body,
        price: Number(req.body.price),
        stock: Number(req.body.stock)
      } as CreateMealRequest
      const file: FileRequest = { path: req.file_path!, url: req.file_url! }
      const meal = await MealService.createMeal(req.user_id!, file, request)

      return responseSuccess(
        res,
        201,
        'Hooray, successfully create meal',
        meal,
        'meal'
      )
    } catch (error) {
      if (req.file_path) deleteFile(req.file_path)
      next(error)
    }

    return null
  }

  /**
   * Get Single Meal
   *
   * @param {UserRequest} req - Request object {params: {id: string}}
   * @param {Response} res - Response object
   * @param {NextFunction} next - Next function
   */
  static async show(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const meal = await MealService.getMeal(req.params.id)

      return responseSuccess(
        res,
        200,
        'Hooray, successfully get meal',
        meal,
        'meal'
      )
    } catch (error) {
      next(error)
    }

    return null
  }
}
