export interface PaginationParams {
    page: number
    limit: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

export interface PaginatedResult<T> {
    data: T[]
    meta: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 10
export const MAX_LIMIT = 100
