import { ChevronLeft, ChevronRight } from 'lucide-react'
import sidebarConfig from '@/layouts/AdminLayout/sidebarConfig'
import SidebarSection from '@/layouts/AdminLayout/components/SidebarSection'

function Sidebar({ role, collapsed, onToggleCollapse, onCloseMobile }) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-white/5 bg-app-sidebar">
      <div className="flex items-center justify-between px-3 py-4">
        {!collapsed ? (
          <div className="px-2">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Workspace</p>
            <h1 className="text-lg font-semibold tracking-tight text-slate-100">HashHub</h1>
          </div>
        ) : (
          <span className="sr-only">HashHub</span>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white lg:inline-flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-2 pb-6">
        {sidebarConfig.map((section) => {
          const allowedItems = section.items.filter((item) => item.roles.includes(role))
          if (!allowedItems.length) return null

          return (
            <SidebarSection
              key={section.title}
              title={section.title}
              items={allowedItems}
              collapsed={collapsed}
              onNavigate={onCloseMobile}
            />
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
