import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { LogOut, Menu, UserCircle2 } from 'lucide-react'
import { clearAuth } from '@/store/authSlice'
import { authService } from '@/services/authService'
import Button from '@/components/ui/Button'

function Header({ title, onToggleMobileSidebar }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

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
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-app-border bg-app-card px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="inline-flex rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <h2 className="truncate text-base font-semibold text-slate-900 lg:text-lg">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <details className="relative">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-app-border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
            <UserCircle2 className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="hidden sm:inline">Account</span>
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-app-border bg-white p-1 shadow-elevated">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start font-normal"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {loggingOut ? 'Signing out…' : 'Log out'}
            </Button>
          </div>
        </details>
      </div>
    </header>
  )
}

export default Header
