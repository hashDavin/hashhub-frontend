import { createSlice } from '@reduxjs/toolkit'
import { TOKEN_KEY } from '@/constants/storage'

const initialState = {
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  hydrated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.hydrated = true
      if (action.payload.token) {
        localStorage.setItem(TOKEN_KEY, action.payload.token)
      }
    },
    setUser(state, action) {
      state.user = action.payload
    },
    clearAuth(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.hydrated = true
      localStorage.removeItem(TOKEN_KEY)
    },
    setHydrated(state, action) {
      state.hydrated = action.payload
    },
  },
})

export const { setAuth, setUser, clearAuth, setHydrated } = authSlice.actions
export default authSlice.reducer
