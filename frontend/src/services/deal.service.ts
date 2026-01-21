import { api } from './api'

export type DealStatus = 'open' | 'won' | 'lost'

export interface Deal {
  id: string
  organizationId: string
  contactId: string | null
  stageId: string | null
  title: string
  value: number
  status: DealStatus
  createdAt: string
}

export interface DealFilters extends PaginationParams {
  search?: string
  status?: 'open' | 'won' | 'lost'
  stageId?: string
  minValue?: number
  maxValue?: number
}

export interface CreateDealDTO {
  contactId?: string
  stageId?: string
  title: string
  value: number
}

export interface UpdateDealDTO {
  contactId?: string | null
  stageId?: string | null
  title?: string
  value?: number
  status?: DealStatus
}

export const dealService = {
  getAll: (filters?: DealFilters) => {
    const params = new URLSearchParams()

    if (filters?.page) params.set('page', String(filters.page))
    if (filters?.limit) params.set('limit', String(filters.limit))
    if (filters?.sortBy) params.set('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder)
    if (filters?.search) params.set('search', filters.search)
    if (filters?.status) params.set('status', filters.status)
    if (filters?.stageId) params.set('stageId', filters.stageId)
    if (filters?.minValue) params.set('minValue', String(filters.minValue))
    if (filters?.maxValue) params.set('maxValue', String(filters.maxValue))

    const query = params.toString()
    return api.get<PaginatedResponse<Deal>>(`/deals${query ? `?${query}` : ''}`)
  },

  getById: (id: string) => api.get<Deal>(`/deals/${id}`),

  create: (data: CreateDealDTO) => api.post<Deal>('/deals', data),

  update: (id: string, data: UpdateDealDTO) =>
    api.put<Deal>(`/deals/${id}`, data),

  delete: (id: string) => api.delete(`/deals/${id}`),
}
