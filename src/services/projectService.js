import apiClient from '@/services/apiClient'
import { unwrapData, unwrapPaginated } from '@/utils/api'

export const projectService = {
  list(params = {}) {
    return apiClient.get('/projects', { params }).then(unwrapPaginated)
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
    return apiClient.get(`/projects/${projectId}/users`, { params }).then(unwrapPaginated)
  },

  assignUsers(projectId, userIds) {
    return apiClient.post(`/projects/${projectId}/assign-users`, { user_ids: userIds })
  },

  removeMember(projectId, userId) {
    return apiClient.delete(`/projects/${projectId}/users/${userId}`)
  },

  listCredentials(projectId, params = {}) {
    return apiClient.get(`/projects/${projectId}/details`, { params }).then(unwrapPaginated)
  },

  createCredential(projectId, payload) {
    return apiClient.post(`/projects/${projectId}/details`, payload).then((res) => unwrapData(res))
  },

  updateCredential(detailId, payload) {
    return apiClient.put(`/details/${detailId}`, payload).then((res) => unwrapData(res))
  },

  deleteCredential(detailId) {
    return apiClient.delete(`/details/${detailId}`)
  },
}
