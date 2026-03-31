import apiClient from '@/services/apiClient'
import { unwrapData } from '@/utils/api'

export const authService = {
  login(payload) {
    return apiClient.post('/login', payload).then((res) => unwrapData(res))
  },
  me() {
    return apiClient.get('/me').then((res) => unwrapData(res))
  },
  logout() {
    return apiClient.post('/logout')
  },
}
