import { RouterProvider } from 'react-router-dom'
import AuthBootstrap from '@/components/common/AuthBootstrap'
import { ToastProvider } from '@/components/notifications/ToastProvider'
import router from '@/routes'

function App() {
  return (
    <ToastProvider>
      <AuthBootstrap />
      <RouterProvider router={router} />
    </ToastProvider>
  )
}

export default App
