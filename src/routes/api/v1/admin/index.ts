import { Router } from 'express'
import { authMiddleware } from '@middlewares/auth.middleware'
import { adminMiddleware } from '@middlewares/role.middleware'

export const adminRouter = Router()
adminRouter.use(authMiddleware, adminMiddleware)
