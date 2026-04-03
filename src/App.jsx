import { RouterProvider } from 'react-router-dom'
import AuthBootstrap from '@/components/common/AuthBootstrap'
import GlobalLoader from '@/components/common/GlobalLoader'
import { ToastProvider } from '@/components/notifications/ToastProvider'
import router from '@/routes'

function App() {
  return (
    <ToastProvider>
      <AuthBootstrap />
      <RouterProvider router={router} />
      <GlobalLoader />
    </ToastProvider>
  )
}

export default App
