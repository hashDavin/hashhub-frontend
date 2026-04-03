import { Suspense, useEffect, useMemo, useState } from 'react'
import { Outlet, useMatches } from 'react-router-dom'
import Sidebar from '@/layouts/AdminLayout/components/Sidebar'
import Header from '@/layouts/AdminLayout/components/Header'
import PageLoader from '@/components/common/PageLoader'
import { ROLES } from '@/constants/roles'
import { useAuth } from '@/hooks/useAuth'

function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const matches = useMatches()
  const { user } = useAuth()
  const role = user?.role || ROLES.SUPER_ADMIN
  const title = useMemo(() => {
    const matched = matches.at(-1)
    return matched?.handle?.title || 'HashHub'
  }, [matches])

  useEffect(() => {
    document.title = `${title} · HashHub`
  }, [title])

  return (
    <div className="min-h-screen bg-white">
      {mobileSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
        />
      ) : null}

      <div
        className={`fixed inset-y-0 left-0 z-40 w-56 transition-transform lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:w-56`}
      >
        <Sidebar role={role} onCloseMobile={() => setMobileSidebarOpen(false)} />
      </div>

      <div className="lg:pl-56">
        <Header onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="w-full p-4 lg:p-6 bg-white">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
