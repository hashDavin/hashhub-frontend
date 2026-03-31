import apiClient from '@/services/apiClient'
import { unwrapPaginated } from '@/utils/api'

export const userService = {
  list(params = {}) {
    return apiClient.get('/users', { params }).then(unwrapPaginated)
  },
}
