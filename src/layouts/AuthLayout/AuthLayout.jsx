import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg p-4">
      <div className="w-full max-w-md space-y-5 rounded-xl border border-app-border bg-app-card p-6 shadow-card">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">HashHub</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Welcome back</h1>
        </div>
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
