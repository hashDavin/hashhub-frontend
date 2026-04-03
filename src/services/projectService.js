import apiClient from '@/services/apiClient'
import { unwrapData, unwrapPaginated } from '@/utils/api'

export const projectService = {
  list(params = {}) {
    return apiClient.get('/projects', { params }).then((res) => {
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

  get(id) {
    return apiClient.get(`/projects/${id}`).then((res) => unwrapData(res))
  },

  create(payload) {
    return apiClient.post('/projects', payload).then((res) => unwrapData(res))
  },

  update(id, payload) {
    return apiClient.put(`/projects/${id}`, payload).then((res) => unwrapData(res))
  },

  remove(id) {
    return apiClient.delete(`/projects/${id}`)
  },

  listMembers(projectId, params = {}) {
    return apiClient.get(`/projects/${projectId}/users`, { params }).then((res) => {
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

  assignUsers(projectId, userIds) {
    return apiClient.post(`/projects/${projectId}/assign-users`, { user_ids: userIds })
  },

  removeMember(projectId, userId) {
    return apiClient.delete(`/projects/${projectId}/users/${userId}`)
  },

  listCredentials(projectId, params = {}) {
    return apiClient.get(`/projects/${projectId}/details`, { params }).then((res) => {
      const payload = res.data?.data
      if (Array.isArray(payload)) {
        const page = Number(params.page || 1)
        const perPage = Number(params.per_page || 25)
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

  createCredential(projectId, payload) {
    const isForm = typeof FormData !== 'undefined' && payload instanceof FormData
    const config = isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
    return apiClient.post(`/projects/${projectId}/details`, payload, config).then((res) => unwrapData(res))
  },

  updateCredential(projectId, detailId, payload) {
    const isForm = typeof FormData !== 'undefined' && payload instanceof FormData
    const config = isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
    return apiClient
      .post(`/projects/${projectId}/details/${detailId}?_method=PUT`, payload, config)
      .then((res) => unwrapData(res))
  },

  deleteCredential(projectId, detailId) {
    return apiClient.delete(`/projects/${projectId}/details/${detailId}`)
  },
}
