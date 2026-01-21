import { Router, type RequestHandler } from 'express'
import type { ContactController } from './ContactController'
import { validateRequest, uuidParamSchema, asyncHandler } from '@shared/http'
import { createContactSchema, updateContactSchema } from './contact.schemas'

export function createContactRoutes(
  controller: ContactController,
  authMiddleware: RequestHandler
): Router {
  const router = Router()

  router.use(authMiddleware)

  router.get('/', asyncHandler((req, res) => controller.getAll(req as any, res)))
  router.get(
    '/:id',
    validateRequest(uuidParamSchema, 'params'),
    asyncHandler((req, res) => controller.getById(req as any, res))
  )
  router.post(
    '/',
    validateRequest(createContactSchema),
    asyncHandler((req, res) => controller.create(req as any, res))
  )
  router.put(
    '/:id',
    validateRequest(uuidParamSchema, 'params'),
    validateRequest(updateContactSchema),
    asyncHandler((req, res) => controller.update(req as any, res))
  )
  router.delete(
    '/:id',
    validateRequest(uuidParamSchema, 'params'),
    asyncHandler((req, res) => controller.delete(req as any, res))
  )

  return router
}
