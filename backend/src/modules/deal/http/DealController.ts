import type { Response } from 'express'
import type { AuthenticatedRequest } from '@shared/http'
import type { DealUseCases } from '../application'
import { NotFoundError, ForbiddenError } from '@shared/http'

export class DealController {
  constructor(private readonly dealUseCases: DealUseCases) {}

  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { organizationId } = req.user
    const deals = await this.dealUseCases.getAllByOrganization(organizationId)
    res.json(deals)
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params
    const deal = await this.dealUseCases.getDealById(id)

    if (!deal) {
      throw new NotFoundError('Deal')
    }

    if (deal.organizationId !== req.user.organizationId) {
      throw new ForbiddenError()
    }

    res.json(deal)
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { organizationId } = req.user
    const { contactId, stageId, title, value } = req.body

    const deal = await this.dealUseCases.createDeal({
      organizationId,
      contactId,
      stageId,
      title,
      value,
    })
    res.status(201).json(deal)
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params
    const { contactId, stageId, title, value, status } = req.body

    const existing = await this.dealUseCases.getDealById(id)
    if (!existing) {
      throw new NotFoundError('Deal')
    }

    if (existing.organizationId !== req.user.organizationId) {
      throw new ForbiddenError()
    }

    const deal = await this.dealUseCases.updateDeal(id, {
      contactId,
      stageId,
      title,
      value,
      status,
    })

    res.json(deal)
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params

    const existing = await this.dealUseCases.getDealById(id)
    if (!existing) {
      throw new NotFoundError('Deal')
    }

    if (existing.organizationId !== req.user.organizationId) {
      throw new ForbiddenError()
    }

    await this.dealUseCases.deleteDeal(id)
    res.status(204).send()
  }
}
