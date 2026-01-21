import type { Response } from 'express'
import type { AuthenticatedRequest } from '@shared/http'
import type { ContactUseCases } from '../application'
import { NotFoundError, ForbiddenError } from '@shared/http'

export class ContactController {
  constructor(private readonly contactUseCases: ContactUseCases) {}

  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { organizationId } = req.user
    const contacts = await this.contactUseCases.getAllByOrganization(organizationId)
    res.json(contacts)
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params
    const contact = await this.contactUseCases.getContactById(id)

    if (!contact) {
      throw new NotFoundError('Contact')
    }

    // Ensure contact belongs to user's organization
    if (contact.organizationId !== req.user.organizationId) {
      throw new ForbiddenError()
    }

    res.json(contact)
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { organizationId } = req.user
    const { name, email, phone } = req.body

    if (!name) {
      res.status(400).json({ error: 'name is required' })
      return
    }

    const contact = await this.contactUseCases.createContact({
      organizationId,
      name,
      email,
      phone,
    })
    res.status(201).json(contact)
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params
    const { name, email, phone } = req.body

    const existing = await this.contactUseCases.getContactById(id)
    if (!existing) {
      throw new NotFoundError('Contact')
    }

    if (existing.organizationId !== req.user.organizationId) {
      throw new ForbiddenError()
    }

    const contact = await this.contactUseCases.updateContact(id, {
      name,
      email,
      phone,
    })

    res.json(contact)
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params

    const existing = await this.contactUseCases.getContactById(id)
    if (!existing) {
      throw new NotFoundError('Contact')
    }

    if (existing.organizationId !== req.user.organizationId) {
      throw new ForbiddenError()
    }

    await this.contactUseCases.deleteContact(id)
    res.status(204).send()
  }
}
