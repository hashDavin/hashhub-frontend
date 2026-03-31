import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { clearAuth, setHydrated, setUser } from '@/store/authSlice'
import { authService } from '@/services/authService'
import { TOKEN_KEY } from '@/constants/storage'

function AuthBootstrap() {
  const dispatch = useDispatch()

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      dispatch(setHydrated(true))
      return
    }
    authService
      .me()
      .then((user) => dispatch(setUser(user)))
      .catch(() => dispatch(clearAuth()))
      .finally(() => dispatch(setHydrated(true)))
  }, [dispatch])

  return null
}

export default AuthBootstrap
