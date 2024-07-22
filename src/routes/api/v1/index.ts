import { Router } from 'express'
import { apiKeyMiddleware } from '@middlewares/api_key.middleware'
import { publicRouter } from '@routes/v1/public'
import { authRouter } from '@routes/v1/auth'
import { adminRouter } from '@routes/v1/admin'
import { userRouter } from '@routes/v1/user'

export const apiRouter = Router()
apiRouter.use(apiKeyMiddleware)

// Public routes
apiRouter.use('/', publicRouter)

// Auth routes
apiRouter.use('/auth', authRouter)

// Admin routes
apiRouter.use('/admin', adminRouter)

// User routes
apiRouter.use('/user', userRouter)
