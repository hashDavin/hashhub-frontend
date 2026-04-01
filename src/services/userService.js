import apiClient from '@/services/apiClient'
import { unwrapPaginated } from '@/utils/api'

export const userService = {
  list(params = {}) {
    return apiClient.get('/users', { params }).then((res) => {
      const payload = res.data?.data
      if (Array.isArray(payload)) {
        const page = Number(params.page || 1)
        const perPage = Number(params.per_page || 15)
        return {
          items: payload,
          meta: {
            current_page: page,
            last_page: page,
            total: payload.length,
            per_page: perPage,
          },
        }
      }
      return unwrapPaginated(res)
    })
  },
  listEmployees(params = {}) {
    return apiClient.get('/employees', { params }).then((res) => {
      const payload = res.data?.data
      if (Array.isArray(payload)) {
        const page = Number(params.page || 1)
        const perPage = Number(params.per_page || 10)
        return {
          items: payload,
          meta: {
            current_page: page,
            last_page: page,
            total: payload.length,
            per_page: perPage,
          },
        }
      }
      return unwrapPaginated(res)
    })
  },
  getEmployee(id) {
    return apiClient.get(`/employees/${id}`)
  },
  createEmployee(payload) {
    return apiClient.post('/employees', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  updateEmployee(id, payload) {
    return apiClient.post(`/employees/${id}?_method=PUT`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteEmployee(id) {
    return apiClient.delete(`/employees/${id}`)
  },
  toggleEmployeeStatus(id) {
    return apiClient.patch(`/employees/${id}/status`)
  },
}
