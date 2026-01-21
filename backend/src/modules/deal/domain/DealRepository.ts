import type { Deal, CreateDealDTO, UpdateDealDTO } from './Deal'
import type { PaginationParams, PaginatedResult } from '@shared/types/pagination'

export interface DealFilterParams extends PaginationParams {
  search?: string
  status?: 'open' | 'won' | 'lost'
  stageId?: string
  minValue?: number
  maxValue?: number
}

export interface DealRepository {
  findAllByOrganization(organizationId: string, params?: DealFilterParams): Promise<PaginatedResult<Deal>>
  findById(id: string): Promise<Deal | null>
  create(data: CreateDealDTO): Promise<Deal>
  update(id: string, data: UpdateDealDTO): Promise<Deal | null>
  delete(id: string): Promise<boolean>
}
