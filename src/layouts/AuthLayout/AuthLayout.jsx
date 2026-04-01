import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <Outlet />
    </div>
  )
}

export default AuthLayout
