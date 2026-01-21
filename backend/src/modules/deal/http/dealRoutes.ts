import { Router, type RequestHandler } from 'express'
import type { DealController } from './DealController'
import { validateRequest, uuidParamSchema, asyncHandler } from '@shared/http'
import { createDealSchema, updateDealSchema } from './deal.schemas'
export function createDealRoutes(
  controller: DealController,
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
    validateRequest(createDealSchema),
    asyncHandler((req, res) => controller.create(req as any, res))
  )
  router.put(
    '/:id',
    validateRequest(uuidParamSchema, 'params'),
    validateRequest(updateDealSchema),
    asyncHandler((req, res) => controller.update(req as any, res))
  )
  router.delete(
    '/:id',
    validateRequest(uuidParamSchema, 'params'),
    asyncHandler((req, res) => controller.delete(req as any, res))
  )

  return router
}
