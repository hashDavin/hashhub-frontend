import { Suspense, useMemo, useState } from 'react'
import { Outlet, useMatches } from 'react-router-dom'
import Sidebar from '@/layouts/AdminLayout/components/Sidebar'
import Header from '@/layouts/AdminLayout/components/Header'
import PageLoader from '@/components/common/PageLoader'
import { ROLES } from '@/constants/roles'
import { useAuth } from '@/hooks/useAuth'

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const matches = useMatches()
  const { user } = useAuth()
  const role = user?.role || ROLES.SUPER_ADMIN
  const title = useMemo(() => {
    const matched = matches.at(-1)
    return matched?.handle?.title || 'HashHub'
  }, [matches])

  return (
    <div className="min-h-screen bg-app-bg">
      {mobileSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
        />
      ) : null}

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transition-transform lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <Sidebar
          role={role}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      </div>

      <div className={`${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <Header title={title} onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="mx-auto max-w-7xl p-4 lg:p-6">
          <Suspense fallback={<PageLoader label="Loading page…" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
