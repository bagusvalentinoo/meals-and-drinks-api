import { Router } from 'express'
import { authMiddleware } from '@middlewares/auth.middleware'
import { userMiddleware } from '@middlewares/role.middleware'

export const userRouter = Router()
userRouter.use(authMiddleware, userMiddleware)
