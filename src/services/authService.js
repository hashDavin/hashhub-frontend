import apiClient from '@/services/apiClient'
import { unwrapData } from '@/utils/api'

export const authService = {
  login(payload) {
    return apiClient.post('/login', payload).then((res) => unwrapData(res))
  },
  /** Silent session hydrate — avoid full-screen loader on every page load. */
  me() {
    return apiClient.get('/me', { skipGlobalLoader: true }).then((res) => unwrapData(res))
  },
  logout() {
    return apiClient.post('/logout', null, { skipGlobalLoader: true })
  },
}
