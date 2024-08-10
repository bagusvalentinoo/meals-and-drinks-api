import { Router } from 'express'
import { localStorageMiddleware } from '@middlewares/local_storage.middleware'
import { CategoryController } from '@controllers/admin/category.controller'

export const categoryRouter = Router()

categoryRouter.get('/', CategoryController.index)
categoryRouter.post(
  '/',
  localStorageMiddleware('images/product/category', 'photo', 1),
  CategoryController.store
)
categoryRouter.get('/:id', CategoryController.show)
categoryRouter.put(
  '/:id',
  localStorageMiddleware('images/product/category', 'photo', 1),
  CategoryController.update
)
categoryRouter.delete('/:id', CategoryController.destroySingle)
categoryRouter.delete('/', CategoryController.destroyBatch)
