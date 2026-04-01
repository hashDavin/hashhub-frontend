import SidebarItem from '@/layouts/AdminLayout/components/SidebarItem'

function SidebarSection({ title, items, collapsed, onNavigate }) {
  return (
    <section>
      {/* {!collapsed ? (
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </p>
      ) : null} */}
      <div className="space-y-1">
        {items.map((item) => (
          <SidebarItem
            key={`${title}-${item.label}`}
            item={item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </section>
  )
}

export default SidebarSection
