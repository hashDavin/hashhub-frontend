import SidebarItem from '@/layouts/AdminLayout/components/SidebarItem'

function SidebarSection({ title, items, collapsed, onNavigate }) {
  return (
    <section>
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
