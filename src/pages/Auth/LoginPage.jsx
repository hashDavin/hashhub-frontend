import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setAuth } from '@/store/authSlice'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'
import { getErrorMessage } from '@/utils/errorMessage'
import Button from '@/components/ui/Button'
import TextInput from '@/components/forms/TextInput'

function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.target)
    setLoading(true)
    try {
      const data = await authService.login({
        email: fd.get('email'),
        password: fd.get('password'),
        device_name: 'web',
      })
      dispatch(setAuth({ token: data.token, user: data.user }))
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold text-slate-900">Sign in to HashHub</h2>
      <p className="mt-2 text-sm text-slate-500">Use your HashHub account.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <TextInput
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
        />
        <TextInput
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </section>
  )
}

export default LoginPage
