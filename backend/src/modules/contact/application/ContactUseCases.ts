import type {
  Contact,
  CreateContactDTO,
  UpdateContactDTO,
  ContactRepository,
  ContactFilterParams,
} from '../domain'
import type { PaginatedResult } from '@shared/types/pagination'

export class ContactUseCases {
  constructor(private readonly contactRepository: ContactRepository) {}

  async getAllByOrganization(organizationId: string, params?: ContactFilterParams): Promise<PaginatedResult<Contact>> {
    return this.contactRepository.findAllByOrganization(organizationId, params)
  }

  async getContactById(id: string): Promise<Contact | null> {
    return this.contactRepository.findById(id)
  }

  async createContact(data: CreateContactDTO): Promise<Contact> {
    return this.contactRepository.create(data)
  }

  async updateContact(id: string, data: UpdateContactDTO): Promise<Contact | null> {
    return this.contactRepository.update(id, data)
  }

  async deleteContact(id: string): Promise<boolean> {
    return this.contactRepository.delete(id)
  }
}
