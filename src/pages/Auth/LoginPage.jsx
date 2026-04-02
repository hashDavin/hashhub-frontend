import { useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setAuth } from '@/store/authSlice'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'
import { getErrorMessage } from '@/utils/errorMessage'
import { useToast } from '@/components/notifications/ToastProvider'
import Button from '@/components/ui/Button'
import SvgIcon from '@/components/ui/SvgIcon'
import TextInput from '@/components/forms/TextInput'
import hashhubLogo from '@/assets/images/hashhub_logo.png'
import loginBg from '@/assets/images/login-bg.png'
import { loginSchema } from '@/validations/authSchemas'

function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const toast = useToast()

  const [submitError, setSubmitError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async ({ email, password }) => {
    setSubmitError('')
    try {
      const data = await authService.login({
        email,
        password,
        device_name: 'web',
      })
      const isInactive = data?.user?.is_active === false || Number(data?.user?.is_active) === 0
      if (isInactive) {
        const inactiveMessage =
          'Your account is currently inactive. Please contact your administrator for assistance.'
        setSubmitError(inactiveMessage)
        toast.error(inactiveMessage)
        return
      }

      dispatch(setAuth({ token: data.token, user: data.user }))
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message = getErrorMessage(err, 'Login failed.')
      setSubmitError(message);
      toast.error(message);
    }
  }

  return (
    <section
      className="relative min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white backdrop-blur-xl shadow-2xl border border-white/20">

          {/* Header */}
          <div className="flex flex-col items-center gap-3 px-8 pt-8 pb-6">
            <div className="h-16 w-48 overflow-hidden">
              <img src={hashhubLogo} alt="HashHub" className="h-full" />
            </div>
            <p className="text-sm text-gray-500">
            Sign in to manage your workspace
            </p>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

              <TextInput
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`w-full h-11 rounded-xl border px-4 pr-12 text-sm outline-none transition ${
                      errors.password
                        ? "border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-500"
                        : "border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    }`}
                    {...register('password')}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <SvgIcon name={showPassword ? "eyeOff" : "eye"} size={18} />
                  </button>
                </div>
                {errors.password ? (
                  <p className="mt-2 text-xs text-red-600">{errors.password.message}</p>
                ) : null}
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    name="remember"
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  className="text-[#3BC2DB] font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {/* Error */}
              {/* {submitError && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-200">
                  {submitError}
                </div>
              )} */}

              {/* Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                size="md"
                className="w-full"
               variant="primary"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>

            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginPage