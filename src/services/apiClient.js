import axios from 'axios'
import { TOKEN_KEY } from '@/constants/storage'
import { store } from '@/store'
import { clearAuth } from '@/store/authSlice'
import { startGlobalLoader, stopGlobalLoader } from '@/store/globalLoaderSlice'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // Bearer tokens in Authorization header do not require cookies on cross-origin API calls.
  // Keep false to avoid CORS requiring Access-Control-Allow-Credentials (or pair with CORS_SUPPORTS_CREDENTIALS=true).
  withCredentials: false,
})

apiClient.interceptors.request.use((config) => {
  if (!config.skipGlobalLoader) {
    store.dispatch(startGlobalLoader())
  }
  const token = localStorage.getItem(TOKEN_KEY) || store.getState().auth?.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => {
    if (!res.config.skipGlobalLoader) {
      store.dispatch(stopGlobalLoader())
    }
    return res
  },
  (err) => {
    if (!err.config?.skipGlobalLoader) {
      store.dispatch(stopGlobalLoader())
    }
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      store.dispatch(clearAuth())
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default apiClient
