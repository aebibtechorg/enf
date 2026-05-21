import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '../../../lib/api'

export interface UserDto {
  id: string
  email: string
  fullName: string
  createdAt: string
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetchApi<UserDto[]>('/api/users'),
  })
}
