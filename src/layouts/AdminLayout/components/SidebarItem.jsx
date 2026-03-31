import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'

function SidebarItem({ item, collapsed, onNavigate }) {
  const location = useLocation()
  const isActive = location.pathname === item.path
  const Icon = item.icon

  return (
    <Link
      to={item.path}
      onClick={onNavigate}
      className={cn(
        'flex items-center rounded-lg px-3 py-2 text-sm transition',
        isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed ? <span className="ml-3">{item.label}</span> : null}
    </Link>
  )
}

export default SidebarItem
