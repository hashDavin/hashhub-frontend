import { Navigate, useLocation } from 'react-router-dom'
import PageLoader from '@/components/common/PageLoader'
import { useAuth } from '@/hooks/useAuth'

function RequireAuth({ children }) {
  const { token, user, hydrated } = useAuth()
  const location = useLocation()

  if (!hydrated) {
    return <PageLoader label="Signing you in…" />
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

export default RequireAuth
