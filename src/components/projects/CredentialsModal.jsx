import { useEffect, useMemo, useState } from 'react'
import ModalShell from '@/components/modals/ModalShell'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import HashHubLoader from '@/components/common/HashHubLoader'
import { getErrorMessage } from '@/utils/errorMessage'
import { projectService } from '@/services/projectService'

function CredentialsModal({ open, projectId, onClose, canAdd = true }) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    type: 'login',
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
  })

  useEffect(() => {
    if (!open || !projectId) return
    setLoading(true)
    projectService
      .listCredentials(projectId, { per_page: 50 })
      .then(({ items }) => setItems(items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [open, projectId])

  const canSubmit = useMemo(() => {
    return Boolean(form.title.trim())
  }, [form.title])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setIsSubmitting(true)
    setError('')
    try {
      await projectService.createCredential(projectId, {
        type: form.type,
        title: form.title.trim(),
        username: form.username.trim() || null,
        password: form.password || null,
        url: form.url.trim() || null,
        notes: form.notes || null,
      })
      const { items: next } = await projectService.listCredentials(projectId, { per_page: 50 })
      setItems(next)
      setForm({ type: 'login', title: '', username: '', password: '', url: '', notes: '' })
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add credential.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} title="Project credentials" size="lg">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-900">Saved credentials</h4>
          {loading ? (
            <div className="flex items-center justify-center rounded-lg border border-app-border py-6">
              <HashHubLoader size="sm" label="Loading credentials..." />
            </div>
          ) : items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-app-border p-4 text-sm text-slate-500">
              No credentials added yet.
            </p>
          ) : (
            <ul className="divide-y divide-app-border rounded-lg border border-app-border">
              {items.map((c) => (
                <li key={c.id} className="px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{c.title}</p>
                      <p className="truncate text-xs text-slate-500">{c.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="truncate text-xs text-slate-600">{c.username || '-'}</p>
                      <p className="truncate text-xs text-slate-400">{c.url || ''}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-900">Add credential</h4>
          {!canAdd ? (
            <p className="text-sm text-slate-500">You don’t have permission to add credentials.</p>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1 text-sm">
                  <span className="text-slate-700">Type</span>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-app-border px-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                  >
                    <option value="login">Login</option>
                    <option value="repo">Repository</option>
                    <option value="server">Server</option>
                    <option value="api">API</option>
                  </select>
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="text-slate-700">Title</span>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g., Production server"
                    className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1 text-sm">
                  <span className="text-slate-700">Username</span>
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                  />
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="text-slate-700">Password</span>
                  <input
                    name="password"
                    type="text"
                    value={form.password}
                    onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                  />
                </label>
              </div>

              <label className="block space-y-1 text-sm">
                <span className="text-slate-700">URL</span>
                <input
                  name="url"
                  value={form.url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                />
              </label>

              <label className="block space-y-1 text-sm">
                <span className="text-slate-700">Notes</span>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-app-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                />
              </label>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <div className="flex justify-end">
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  <span className="inline-flex items-center gap-2">
                    {isSubmitting ? <Spinner size="sm" /> : null}
                    Add credential
                  </span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ModalShell>
  )
}

export default CredentialsModal

