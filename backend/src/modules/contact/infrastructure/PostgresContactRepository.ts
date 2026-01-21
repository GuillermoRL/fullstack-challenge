import type { Repository, FindOptionsWhere} from 'typeorm'
import { ILike } from 'typeorm'
import type {
  Contact,
  CreateContactDTO,
  UpdateContactDTO,
  ContactRepository,
  ContactFilterParams
} from '../domain'
import { ContactEntity } from './ContactEntity'

export class PostgresContactRepository implements ContactRepository {
  constructor(private readonly repository: Repository<ContactEntity>) {}

  async findAllByOrganization(
    organizationId: string,
    params?: ContactFilterParams
  ): Promise<PaginatedResult<Contact>> {
    const page = params?.page ?? DEFAULT_PAGE
    const limit = params?.limit ?? DEFAULT_LIMIT
    const sortBy = params?.sortBy ?? 'createdAt'
    const sortOrder = params?.sortOrder ?? 'DESC'

    // Build where conditions
    const where: FindOptionsWhere<ContactEntity> = { organizationId }

    // Add search filter if provided
    if (params?.search) {
      // Search across name, email, phone
      const searchPattern = `%${params.search}%`
      where.name = ILike(searchPattern)
      // For OR conditions with search, use query builder (see alternative below)
    }

    const [entities, total] = await this.repository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    })

    return {
      data: entities.map((e) => e.toDomain()),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: string): Promise<Contact | null> {
    const entity = await this.repository.findOne({ where: { id } })
    return entity?.toDomain() ?? null
  }

  async create(data: CreateContactDTO): Promise<Contact> {
    const entity = this.repository.create({
      organizationId: data.organizationId,
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
    })
    const saved = await this.repository.save(entity)
    return saved.toDomain()
  }

  async update(id: string, data: UpdateContactDTO): Promise<Contact | null> {
    const entity = await this.repository.findOne({ where: { id } })
    if (!entity) return null

    if (data.name !== undefined) entity.name = data.name
    if (data.email !== undefined) entity.email = data.email
    if (data.phone !== undefined) entity.phone = data.phone

    const saved = await this.repository.save(entity)
    return saved.toDomain()
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id)
    return (result.affected ?? 0) > 0
  }
}
