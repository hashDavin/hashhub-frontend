import sidebarConfig from '@/layouts/AdminLayout/sidebarConfig'
import SidebarSection from '@/layouts/AdminLayout/components/SidebarSection'
import hashhubLogo from '@/assets/images/hashhub_logo.png'

function Sidebar({ role, onCloseMobile }) {
  const visibleSections = sidebarConfig
    .map((section) => {
      const items = section.items
        .filter((item) => item.roles.includes(role))
        .map((item) => {
          if (!item.children) return item
          const visibleChildren = item.children.filter((child) => child.roles.includes(role))
          return { ...item, children: visibleChildren }
        })
        .filter((item) => !item.children || item.children.length > 0)
      return { ...section, items }
    })
    .filter((section) => section.items.length > 0)

  return (
    <aside className="flex h-full w-full flex-col border border-app-border bg-white p-2 shadow-card">
      <div className="flex items-center px-2 py-2.5">
        <div className="inline-flex items-center rounded-lg px-1 py-1 text-white">
          <img src={hashhubLogo} alt="HashHub" className="h-14 w-auto max-w-[9.5rem] object-contain object-left" />
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-1 pb-4 pt-2">
        {visibleSections?.length > 0 && visibleSections.map((section) => (
          <SidebarSection
            key={section.title}
            title={section.title}
            items={section.items}
            collapsed={false}
            onNavigate={onCloseMobile}
          />
        ))}
      </nav>

      {/* {!collapsed ? (
        <div className="mt-2 rounded-2xl bg-brand/10 p-2">
          <div className="flex items-center justify-center overflow-hidden rounded-xl bg-brand/20">
            <img
              src={supportIllustration}
              alt="Support"
              className="h-24 w-24 object-cover object-top"
            />
          </div>
        </div>
      ) : null} */}
    </aside>
  )
}

export default Sidebar
