import { z } from 'zod'
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../types/pagination'

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
})

export type PaginationQuery = z.infer<typeof paginationSchema>
