import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchApi } from '../lib/api'

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface UsePaginatedQueryOptions {
  queryKey: unknown[]
  path: string
  page?: number
  pageSize?: number
  params?: Record<string, string | number | boolean | undefined>
}

export function usePaginatedQuery<T>({
  queryKey,
  path,
  page = 1,
  pageSize = 20,
  params = {},
}: UsePaginatedQueryOptions) {
  return useQuery({
    queryKey: [...queryKey, page, pageSize, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('page', page.toString())
      searchParams.set('pageSize', pageSize.toString())
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, value.toString())
        }
      })

      const queryString = searchParams.toString()
      const fullPath = queryString ? `${path}?${queryString}` : path
      
      return fetchApi<PaginatedResponse<T>>(fullPath)
    },
    placeholderData: keepPreviousData,
  })
}
