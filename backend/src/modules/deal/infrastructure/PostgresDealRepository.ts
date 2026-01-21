import type { Repository } from 'typeorm'
import type { Deal, CreateDealDTO, UpdateDealDTO, DealRepository, DealFilterParams } from '../domain'
import { DealEntity } from './DealEntity'
import { PaginatedResult } from '@shared/types/pagination'

export class PostgresDealRepository implements DealRepository {
  constructor(private readonly repository: Repository<DealEntity>) {}

  async findAllByOrganization(
    organizationId: string,
    params?: DealFilterParams
  ): Promise<PaginatedResult<Deal>> {
    const page = params?.page ?? DEFAULT_PAGE
    const limit = params?.limit ?? DEFAULT_LIMIT
    const sortBy = params?.sortBy ?? 'createdAt'
    const sortOrder = params?.sortOrder ?? 'DESC'

    const qb = this.repository.createQueryBuilder('deal')
      .where('deal.organizationId = :organizationId', { organizationId })

    // Status filter
    if (params?.status) {
      qb.andWhere('deal.status = :status', { status: params.status })
    }

    // Stage filter
    if (params?.stageId) {
      qb.andWhere('deal.stageId = :stageId', { stageId: params.stageId })
    }

    // Value range filters
    if (params?.minValue !== undefined) {
      qb.andWhere('deal.value >= :minValue', { minValue: params.minValue })
    }
    if (params?.maxValue !== undefined) {
      qb.andWhere('deal.value <= :maxValue', { maxValue: params.maxValue })
    }

    qb.orderBy(`deal.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)

    const [entities, total] = await qb.getManyAndCount()
    return {
      data: entities.map((e) => e.toDomain()),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async findById(id: string): Promise<Deal | null> {
    const entity = await this.repository.findOne({ where: { id } })
    return entity?.toDomain() ?? null
  }

  async create(data: CreateDealDTO): Promise<Deal> {
    const entity = this.repository.create({
      organizationId: data.organizationId,
      contactId: data.contactId ?? null,
      stageId: data.stageId ?? null,
      title: data.title,
      value: data.value,
      status: 'open',
    })
    const saved = await this.repository.save(entity)
    return saved.toDomain()
  }

  async update(id: string, data: UpdateDealDTO): Promise<Deal | null> {
    const entity = await this.repository.findOne({ where: { id } })
    if (!entity) return null

    if (data.contactId !== undefined) entity.contactId = data.contactId
    if (data.stageId !== undefined) entity.stageId = data.stageId
    if (data.title !== undefined) entity.title = data.title
    if (data.value !== undefined) entity.value = data.value
    if (data.status !== undefined) entity.status = data.status

    const saved = await this.repository.save(entity)
    return saved.toDomain()
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id)
    return (result.affected ?? 0) > 0
  }
}
