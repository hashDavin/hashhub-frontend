import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setAuth } from '@/store/authSlice'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'
import { getErrorMessage } from '@/utils/errorMessage'
import Button from '@/components/ui/Button'
import SvgIcon from '@/components/ui/SvgIcon'
import TextInput from '@/components/forms/TextInput'
import illustration from '@/assets/images/Illustration.png'

function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
      <div className="grid w-full overflow-hidden rounded-2xl border border-app-border bg-white shadow-card lg:grid-cols-2">
        <aside className="flex flex-col justify-between bg-brand p-8 text-white">
          <div>
            <div className="inline-flex items-center gap-3 rounded-lg bg-white/15 px-3 py-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-sm font-bold text-brand">
                HH
              </span>
              <span className="text-lg font-semibold">HashHub</span>
            </div>
            <h2 className="mt-8 text-4xl font-semibold leading-tight">
              Your place to work
              <br />
              Plan. Create. Control.
            </h2>
          </div>
          <img src={illustration} alt="Project management illustration" className="mt-8 max-w-md self-center" />
        </aside>

        <div className="flex items-center justify-center p-8 sm:p-10">
          <div className="w-full max-w-md">
            <h3 className="text-center text-2xl font-semibold text-slate-900">Sign In to HashHub</h3>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <TextInput
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="yourmail@gmail.com"
              />
              <label htmlFor="password" className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-10 w-full rounded-lg border border-app-border px-3 pr-11 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-soft"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-slate-500 hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <SvgIcon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-slate-600">
                  <input type="checkbox" name="remember" className="h-4 w-4 rounded border-app-border" />
                  Remember me
                </label>
                <button type="button" className="text-brand hover:text-brand-hover">
                  Forgot Password?
                </button>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <div className="flex justify-center">
                <Button type="submit" disabled={loading} icon="arrowRight" className="mx-auto flex min-w-36">
                  {loading ? 'Signing in…' : 'Sign In'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
