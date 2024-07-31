import { Router } from 'express'
import { authMiddleware } from '@middlewares/auth.middleware'
import { adminMiddleware } from '@middlewares/role.middleware'
import { tagRouter } from '@routes/v1/admin/tag.route'

export const adminRouter = Router()
adminRouter.use(authMiddleware, adminMiddleware)

adminRouter.use('/tags', tagRouter)
