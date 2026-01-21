import { Router } from 'express'
import type { AuthController } from './AuthController'
import type { RequestHandler } from 'express'

export function createAuthRoutes(controller: AuthController, authMiddleware: RequestHandler): Router {
  const router = Router()

  router.post('/register', (req, res) => controller.register(req, res))
  router.post('/login', (req, res) => controller.login(req, res))
  router.post('/refresh', (req, res) => controller.refresh(req, res))
  router.post('/logout', (req, res) => controller.logout(req, res))
  router.post('/logout-all', authMiddleware, (req, res) => controller.logoutAll(req, res))

  return router
}
