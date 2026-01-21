import type { Contact, CreateContactDTO, UpdateContactDTO } from './Contact'
import type { PaginationParams, PaginatedResult } from '@shared/types/pagination'

export interface ContactFilterParams extends PaginationParams {
  search?: string
}

export interface ContactRepository {
  findAllByOrganization(
    organizationId: string,
    params?: ContactFilterParams
  ): mise<PaginatedResult<Contact>>
  findById(id: string): Promise<Contact | null>
  create(data: CreateContactDTO): Promise<Contact>
  update(id: string, data: UpdateContactDTO): Promise<Contact | null>
  delete(id: string): Promise<boolean>
}
