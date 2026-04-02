import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, Settings, UserCircle2 } from 'lucide-react'
import { clearAuth } from '@/store/authSlice'
import { authService } from '@/services/authService'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

function Header({ title, onToggleMobileSidebar }) {
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

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-end border-b border-app-border bg-white/95 px-4 backdrop-blur lg:px-6">
      <button
        type="button"
        onClick={onToggleMobileSidebar}
        className="inline-flex rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-xl border border-app-border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Open account menu"
        >
          <UserCircle2 className="h-4 w-4 shrink-0 text-slate-500" />
          <span className="hidden sm:inline">Account</span>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>

        {menuOpen ? (
          <div className="absolute right-4 top-14 z-30 w-48 rounded-xl border border-app-border bg-white p-1.5 shadow-elevated lg:right-6">
            <div className="border-b border-slate-100 px-2 py-1.5">
              <p className="truncate text-xs text-slate-500">{user?.email || 'Signed in'}</p>
            </div>

            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="mt-1 inline-flex w-full items-center rounded-lg px-2.5 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              <UserCircle2 className="mr-2 h-4 w-4" />
              Profile
            </Link>

            <Link
              to="/settings"
              onClick={() => setMenuOpen(false)}
              className="inline-flex w-full items-center rounded-lg px-2.5 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start font-normal text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {loggingOut ? 'Signing out...' : 'Log out'}
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  )
}

export default Header
