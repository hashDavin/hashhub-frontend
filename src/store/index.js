import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/store/authSlice'
import globalLoaderReducer from '@/store/globalLoaderSlice'
import { hashHubApi } from '@/store/hashHubApi'

const store = configureStore({
  reducer: {
    auth: authReducer,
    globalLoader: globalLoaderReducer,
    [hashHubApi.reducerPath]: hashHubApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(hashHubApi.middleware),
})

export { store }
export default store
