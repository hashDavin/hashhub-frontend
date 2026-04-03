import { FolderKanban, LayoutDashboard, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/constants/roles'

function DashboardPage() {
  const { user } = useAuth()
  const role = user?.role
  const showUsers = role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Welcome back. Pick a workspace below or use the sidebar.
        </p>
      </div>
    </div>
  )
}

export default DashboardPage
