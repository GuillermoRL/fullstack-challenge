import { Router } from 'express'
import type { AuthController } from './AuthController'
import type { RequestHandler } from 'express'
import { validateRequest, asyncHandler } from '@shared/http'
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schemas'

export function createAuthRoutes(controller: AuthController, authMiddleware: RequestHandler): Router {
  const router = Router()

  router.post(
    '/register',
    validateRequest(registerSchema),
    (req, res) => controller.register(req, res)
  )
  router.post(
    '/login',
    validateRequest(loginSchema),
    (req, res) => controller.login(req, res)
  )
  router.post(
    '/refresh',
    validateRequest(refreshTokenSchema),
    (req, res) => controller.refresh(req, res)
  )
  router.post(
    '/logout',
    validateRequest(refreshTokenSchema),
    (req, res) => controller.logout(req, res)
  )
  router.post(
    '/logout-all',
    authMiddleware,
    (req, res) => controller.logoutAll(req, res)
  )

  return router
}
