import { Router } from 'express'
import { authMiddleware } from '@middlewares/auth.middleware'
import { adminMiddleware } from '@middlewares/role.middleware'
import { tagRouter } from '@routes/v1/admin/tag.route'
import { categoryRouter } from '@routes/v1/admin/category.route'
import { mealRouter } from '@routes/v1/admin/meal.route'

export const adminRouter = Router()
adminRouter.use(authMiddleware, adminMiddleware)

adminRouter.use('/tags', tagRouter)
adminRouter.use('/categories', categoryRouter)
adminRouter.use('/meals', mealRouter)
