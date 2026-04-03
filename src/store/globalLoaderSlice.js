import { createSlice } from '@reduxjs/toolkit'

const globalLoaderSlice = createSlice({
  name: 'globalLoader',
  initialState: {
    pending: 0,
  },
  reducers: {
    startGlobalLoader(state) {
      state.pending += 1
    },
    stopGlobalLoader(state) {
      state.pending = Math.max(0, state.pending - 1)
    },
    resetGlobalLoader(state) {
      state.pending = 0
    },
  },
})

export const { startGlobalLoader, stopGlobalLoader, resetGlobalLoader } = globalLoaderSlice.actions

export function selectGlobalLoaderPending(state) {
  return state.globalLoader.pending
}

export default globalLoaderSlice.reducer
