import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Menu, Settings, User } from 'lucide-react'
import { clearAuth } from '@/store/authSlice'
import { authService } from '@/services/authService'
import Spinner from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'

const menuItemClass =
  'flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50'

function Header({ onToggleMobileSidebar }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await authService.logout()
    } catch {
      /* still clear local session */
    }
    dispatch(clearAuth())
    navigate('/login', { replace: true })
    setLoggingOut(false)
    setMenuOpen(false)
  }

  const displayName = user?.name?.trim() || 'User'
  const displayEmail = user?.email || ''

  return (
    <header className="sticky top-0 z-20 flex h-[4.25rem] shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-4 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="inline-flex shrink-0 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      <div className="relative flex shrink-0 items-center gap-5" ref={menuRef}>
        <button
          type="button"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Notifications"
        >
          <Bell className="h-[22px] w-[22px]" strokeWidth={1.75} />
          <span
            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand ring-[3px] ring-white"
            aria-hidden
          />
        </button>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="group flex max-w-[min(100vw-10rem,22rem)] items-center gap-3 rounded-lg py-1.5 pl-0 pr-0 transition hover:bg-slate-50/90 sm:gap-3.5 sm:pr-1"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Account menu"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
            <User className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <span className="hidden min-w-0 flex-col gap-0.5 text-left sm:flex">
            <span className="truncate text-sm font-bold leading-none text-slate-900">
              {displayName}
            </span>
            <span className="truncate text-xs font-normal leading-tight text-slate-500">
              {displayEmail}
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
            strokeWidth={2}
            aria-hidden
          />
        </button>

        {menuOpen ? (
          <div
            className="absolute right-0 top-[calc(100%+10px)] z-30 w-[min(100vw-2rem,15rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_40px_-10px_rgba(15,23,42,0.18)]"
            role="menu"
          >
            <div className="border-b border-slate-100 px-4 py-3 sm:hidden">
              <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
              <p className="truncate text-xs text-slate-500">{displayEmail}</p>
            </div>

            <Link
              to="/profile"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className={`${menuItemClass} border-b border-slate-100 sm:rounded-t-xl`}
            >
              <User className="h-[18px] w-[18px] shrink-0 text-slate-500" strokeWidth={1.75} />
              Profile
            </Link>

            <Link
              to="/settings"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className={`${menuItemClass} border-b border-slate-100`}
            >
              <Settings className="h-[18px] w-[18px] shrink-0 text-slate-500" strokeWidth={1.75} />
              Settings
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={loggingOut}
              className={`${menuItemClass} rounded-b-xl text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-60`}
            >
              {loggingOut ? (
                <Spinner size="sm" className="h-[18px] w-[18px] shrink-0" />
              ) : (
                <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
              )}
              Log out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}

export default Header
