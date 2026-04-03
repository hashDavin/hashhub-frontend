import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/store/authSlice'
import globalLoaderReducer from '@/store/globalLoaderSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    globalLoader: globalLoaderReducer,
  },
})

export { store }
export default store
