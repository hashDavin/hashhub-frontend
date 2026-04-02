import { useEffect, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearAuth } from '@/store/authSlice'
import { authService } from '@/services/authService'
import { cn } from '@/utils/cn'

function SidebarItem({ item, collapsed, onNavigate }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const children = useMemo(() => item.children ?? [], [item.children])
  const hasChildren = children.length > 0
  const activeChild = children.find((child) => location.pathname === child.path)
  const isActive = hasChildren ? Boolean(activeChild) : location.pathname === item.path
  const [expanded, setExpanded] = useState(isActive)

  useEffect(() => {
    if (isActive) {
      setExpanded(true)
    }
  }, [isActive])

  const Icon = item.icon

  const handleLogout = async (e) => {
    e.preventDefault()
    try {
      await authService.logout()
    } catch {
      /* no-op: clear local auth regardless */
    }
    dispatch(clearAuth())
    navigate('/login', { replace: true })
    if (onNavigate) onNavigate()
  }

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className={cn(
            'flex w-full items-center rounded-xl px-3 py-2.5 text-sm transition',
            isActive ? 'bg-[#3BC2DB] text-white' : 'text-slate-500 hover:bg-[#3BC2DB] hover:text-white'
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!collapsed ? (
            <>
              <span className="ml-3">{item.label}</span>
              <ChevronDown
                className={cn('ml-auto h-4 w-4 transition-transform', expanded ? 'rotate-180' : 'rotate-0')}
              />
            </>
          ) : null}
        </button>

        {!collapsed && expanded ? (
          <div className="space-y-1 pl-4">
            {children.map((child) => {
              const ChildIcon = child.icon
              const childActive = location.pathname === child.path
              return (
                <Link
                  key={`${item.label}-${child.label}`}
                  to={child.path}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center rounded-xl px-3 py-2 text-sm transition',
                    childActive
                      ? 'bg-[#3BC2DB] text-white'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  )}
                >
                  <ChildIcon className="h-4 w-4 shrink-0" />
                  <span className="ml-3">{child.label}</span>
                </Link>
              )
            })}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <Link
      to={item.path}
      onClick={item.action === 'logout' ? handleLogout : onNavigate}
      className={cn(
        'flex items-center rounded-xl px-3 py-2.5 text-sm transition',
        isActive ? 'bg-brand-soft text-brand' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed ? <span className="ml-3">{item.label}</span> : null}
    </Link>
  )
}

export default SidebarItem
