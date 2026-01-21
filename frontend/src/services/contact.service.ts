import { api } from './api'
import type { PaginatedResponse, PaginationParams } from '../types/pagination'

export interface Contact {
  id: string
  organizationId: string
  name: string
  email: string | null
  phone: string | null
  createdAt: string
}

export interface ContactFilters extends PaginationParams {
  search?: string
}

export interface CreateContactDTO {
  name: string
  email?: string
  phone?: string
}

export interface UpdateContactDTO {
  name?: string
  email?: string
  phone?: string
}

export const contactService = {
  getAll: (filters?: ContactFilters) => {
    const params = new URLSearchParams()

    if (filters?.page) params.set('page', String(filters.page))
    if (filters?.limit) params.set('limit', String(filters.limit))
    if (filters?.sortBy) params.set('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder)
    if (filters?.search) params.set('search', filters.search)

    const query = params.toString()
    return api.get<PaginatedResponse<Contact>>(`/contacts${query ? `?${query}` : ''}`)
  },

  getById: (id: string) => api.get<Contact>(`/contacts/${id}`),

  create: (data: CreateContactDTO) => api.post<Contact>('/contacts', data),

  update: (id: string, data: UpdateContactDTO) =>
    api.put<Contact>(`/contacts/${id}`, data),

  delete: (id: string) => api.delete(`/contacts/${id}`),
}
