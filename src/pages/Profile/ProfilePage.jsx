import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'

function getInitials(name = '') {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const second = parts[1]?.[0] ?? ''
  return `${first}${second}`.toUpperCase() || 'NA'
}

function ProfilePage() {
  const { user } = useAuth()

  const avatarUrl = useMemo(
    () => user?.avatar_url || user?.avatar || user?.profile_image_url || user?.image_url || '',
    [user]
  )

  return (
    <section className="rounded-xl border border-app-border bg-app-card p-6 shadow-card">
      <h2 className="text-xl font-semibold text-slate-900">Profile</h2>

      <div className="mt-5 flex items-center gap-4 rounded-xl border border-app-border bg-white p-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt={user?.name || 'Profile'} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-base font-semibold text-brand">
            {getInitials(user?.name)}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-900">{user?.name || 'Unknown user'}</p>
          <p className="truncate text-sm text-slate-600">{user?.email || '-'}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
            {(user?.role || '-').replace(/_/g, ' ')}
          </p>
        </div>
      </div>
    </section>
  )
}

export default ProfilePage
