import type { Response, NextFunction } from 'express'
import type { UserRequest } from '@type/http/user_request.type'
import type { PaginationRequest } from '@type/model/page.type'
import type {
  CreateTagRequest,
  UpdateTagRequest,
  DeleteBatchTagsRequest
} from '@type/model/tag.type'
import { TagService } from '@services/admin/tag.service'
import { responseSuccess } from '@utils/http/response.util'

export class TagController {
  /**
   * Get all tags with pagination
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
      const tags = await TagService.getTags(request)

      return responseSuccess(
        res,
        200,
        'Hooray, successfully get all tags',
        tags
      )
    } catch (error) {
      next(error)
    }

    return null
  }

  /**
   * Create single or batch tags
   *
   * @param {UserRequest} req - Request object {body: CreateTagRequest}
   * @param {Response} res - Response object
   * @param {NextFunction} next - Next function
   */
  static async store(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const request: CreateTagRequest = req.body as CreateTagRequest
      const tags = await TagService.createTags(req.user_id!, request)

      return responseSuccess(
        res,
        201,
        'Hooray, successfully create tags',
        tags,
        'tags'
      )
    } catch (error) {
      next(error)
    }

    return null
  }

  /**
   * Get single tag
   *
   * @param {UserRequest} req - Request object {params: {id: string}}
   * @param {Response} res - Response object
   * @param {NextFunction} next - Next function
   */
  static async show(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const tagId = await TagService.findTagById(req.params.id as string)
      const tag = await TagService.getTag(tagId)

      return responseSuccess(
        res,
        200,
        'Hooray, successfully get tag',
        tag,
        'tag'
      )
    } catch (error) {
      next(error)
    }

    return null
  }

  /**
   * Update single tag
   *
   * @param {UserRequest} req - Request object {params: {id: string}}
   * @param {Response} res - Response object
   * @param {NextFunction} next - Next function
   */
  static async update(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const request: UpdateTagRequest = req.body as UpdateTagRequest
      const tagId = await TagService.findTagById(req.params.id as string)
      const tag = await TagService.updateTag(tagId, req.user_id!, request)

      return responseSuccess(
        res,
        200,
        'Hooray, successfully update tag',
        tag,
        'tag'
      )
    } catch (error) {
      next(error)
    }

    return null
  }

  /**
   * Delete single tag
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
      const tagId = await TagService.findTagById(req.params.id as string)
      await TagService.deleteSingleTag(tagId)

      return responseSuccess(res, 200, 'Hooray, successfully delete tag')
    } catch (error) {
      next(error)
    }

    return null
  }

  /**
   * Delete batch tags
   *
   * @param {UserRequest} req - Request object {body: DeleteBatchTagsRequest}
   * @param {Response} res - Response object
   * @param {NextFunction} next - Next function
   */
  static async destroyBatch(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const request: DeleteBatchTagsRequest = req.body as DeleteBatchTagsRequest
      const deletedTagsCount = await TagService.deleteBatchTags(request)

      return responseSuccess(
        res,
        200,
        `Hooray, successfully delete ${deletedTagsCount} tags`
      )
    } catch (error) {
      next(error)
    }

    return null
  }
}
