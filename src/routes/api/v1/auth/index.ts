import { Router } from 'express'
import { AuthController } from '@controllers/auth/auth.controller'
import { authMiddleware } from '@middlewares/auth.middleware'

export const authRouter = Router()

authRouter.post('/sign-in', AuthController.signIn)
authRouter.post('/sign-up', AuthController.signUp)
authRouter.post('/refresh-token', AuthController.refreshToken)
authRouter.get('/me', authMiddleware, AuthController.me)
authRouter.post('/sign-out', authMiddleware, AuthController.signOut)
