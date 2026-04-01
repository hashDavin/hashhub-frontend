import { FolderKanban, LayoutDashboard, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/constants/roles'

function DashboardPage() {
  const { user } = useAuth()
  const role = user?.role
  const showUsers = role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN

  const cards = [
    {
      title: 'Projects',
      description: 'View and manage all projects you can access.',
      href: '/projects',
      icon: FolderKanban,
    },
    {
      title: 'My projects',
      description: 'Jump to projects you are assigned to.',
      href: '/my-projects',
      icon: LayoutDashboard,
    },
    ...(showUsers
      ? [
          {
            title: 'Employees',
            description: 'Manage team accounts.',
            href: '/employees',
            icon: Users,
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Welcome back. Pick a workspace below or use the sidebar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ title, description, href, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            className="group rounded-xl border border-app-border bg-app-card p-5 shadow-card transition hover:border-brand/30 hover:shadow-elevated"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-900 group-hover:text-brand">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <section className="rounded-xl border border-dashed border-app-border bg-slate-50/80 p-6 text-sm text-slate-600">
        <p className="font-medium text-slate-800">What&apos;s next</p>
        <p className="mt-2 leading-relaxed">
          Notifications, file uploads, and multi-organization support can plug into this shell
          without changing layout or routing.
        </p>
      </section>
    </div>
  )
}

export default DashboardPage
