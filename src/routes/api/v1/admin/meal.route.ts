import { Router } from 'express'
import { localStorageMiddleware } from '@middlewares/local_storage.middleware'
import { MealController } from '@controllers/admin/meal.controller'

export const mealRouter = Router()

mealRouter.get('/', MealController.index)
mealRouter.post(
  '/',
  localStorageMiddleware('images/product/meal', 'photo', 2),
  MealController.store
)
mealRouter.get('/:id', MealController.show)
