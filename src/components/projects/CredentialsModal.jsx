import { useMemo, useState } from 'react'
import ModalShell from '@/components/modals/ModalShell'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { projectService } from '@/services/projectService'
import { getErrorMessage } from '@/utils/errorMessage'

const blankRepo = () => ({ label: '', url: '' })
const blankServer = () => ({ label: '', url: '' })
const blankLogin = () => ({ label: '', username: '', password: '' })
const blankFile = () => ({ label: '', file: null })

function CredentialsModal({ open, projectId, onClose, canAdd = true }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    repositories: [blankRepo()],
    servers: [blankServer()],
    logins: [blankLogin()],
    files: [blankFile()],
    notes: '',
  })

  const hasAnyData = useMemo(() => {
    const hasRepos = form.repositories.some((row) => row.label.trim() || row.url.trim())
    const hasServers = form.servers.some((row) => row.label.trim() || row.url.trim())
    const hasLogins = form.logins.some((row) => row.label.trim() || row.username.trim() || row.password.trim())
    const hasFiles = form.files.some((row) => row.label.trim() || row.file instanceof File)
    return hasRepos || hasServers || hasLogins || hasFiles
  }, [form])

  const updateListRow = (section, index, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: prev[section].map((row, idx) => (idx === index ? { ...row, [key]: value } : row)),
    }))
  }

  const addRow = (section, createBlankRow) => {
    setForm((prev) => ({ ...prev, [section]: [...prev[section], createBlankRow()] }))
  }

  const removeRow = (section, index, createBlankRow) => {
    setForm((prev) => {
      const nextRows = prev[section].filter((_, idx) => idx !== index)
      return { ...prev, [section]: nextRows.length ? nextRows : [createBlankRow()] }
    })
  }

  const pushIfComplete = (items, row, toPayload) => {
    const payload = toPayload(row)
    const hasContent = Object.values(payload).some((value) => {
      if (typeof value === 'string') return value.trim().length > 0
      return value instanceof File
    })
    if (!hasContent) return

    if (!payload.title?.trim()) {
      throw new Error('Please add a label for each filled row before saving.')
    }
    items.push(payload)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!hasAnyData) {
      setError('Add at least one repository, server, login, or file entry.')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const commonNotes = form.notes.trim()
      const payloads = []

      form.repositories.forEach((row) =>
        pushIfComplete(payloads, row, (item) => ({
          type: 'repo',
          title: item.label.trim(),
          url: item.url.trim() || null,
          notes: commonNotes || null,
        }))
      )

      form.servers.forEach((row) =>
        pushIfComplete(payloads, row, (item) => ({
          type: 'server',
          title: item.label.trim(),
          url: item.url.trim() || null,
          notes: commonNotes || null,
        }))
      )

      form.logins.forEach((row) =>
        pushIfComplete(payloads, row, (item) => ({
          type: 'login',
          title: item.label.trim(),
          username: item.username.trim() || null,
          password: item.password || null,
          notes: commonNotes || null,
        }))
      )

      form.files.forEach((row) =>
        pushIfComplete(payloads, row, (item) => {
          const fd = new FormData()
          fd.append('type', 'api')
          fd.append('title', item.label.trim())
          if (commonNotes) fd.append('notes', commonNotes)
          if (item.file instanceof File) fd.append('attachment', item.file)
          return fd
        })
      )

      if (payloads.length === 0) {
        setError('No complete entries found. Add label and details, then save.')
        setIsSubmitting(false)
        return
      }

      await Promise.all(payloads.map((payload) => projectService.createCredential(projectId, payload)))

      setSuccess(`${payloads.length} credential ${payloads.length === 1 ? 'entry' : 'entries'} saved.`)
      setForm({
        repositories: [blankRepo()],
        servers: [blankServer()],
        logins: [blankLogin()],
        files: [blankFile()],
        notes: '',
      })
    } catch (err) {
      setError(getErrorMessage(err, err?.message || 'Failed to save credentials.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} title="Add Project Credentials" size="lg">
      <div className="space-y-5">
        {!canAdd ? <p className="text-sm text-slate-500">You don’t have permission to add credentials.</p> : null}
        {canAdd ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-xl border border-app-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Repositories</h3>
                <Button type="button" variant="secondary" size="sm" onClick={() => addRow('repositories', blankRepo)}>
                  + Add
                </Button>
              </div>
              <div className="space-y-2">
                {form.repositories.map((row, index) => (
                  <div key={`repo-${index}`} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <input
                      value={row.label}
                      onChange={(e) => updateListRow('repositories', index, 'label', e.target.value)}
                      placeholder="Label (e.g. Frontend repo)"
                      className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                    />
                    <input
                      value={row.url}
                      onChange={(e) => updateListRow('repositories', index, 'url', e.target.value)}
                      placeholder="Repository URL"
                      className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                    />
                    <Button
                      type="button"
                      variant="dangerGhost"
                      size="sm"
                      onClick={() => removeRow('repositories', index, blankRepo)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-app-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Servers</h3>
                <Button type="button" variant="secondary" size="sm" onClick={() => addRow('servers', blankServer)}>
                  + Add
                </Button>
              </div>
              <div className="space-y-2">
                {form.servers.map((row, index) => (
                  <div key={`server-${index}`} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <input
                      value={row.label}
                      onChange={(e) => updateListRow('servers', index, 'label', e.target.value)}
                      placeholder="Label (e.g. Admin panel)"
                      className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                    />
                    <input
                      value={row.url}
                      onChange={(e) => updateListRow('servers', index, 'url', e.target.value)}
                      placeholder="Server URL"
                      className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                    />
                    <Button type="button" variant="dangerGhost" size="sm" onClick={() => removeRow('servers', index, blankServer)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-app-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Login Credentials</h3>
                <Button type="button" variant="secondary" size="sm" onClick={() => addRow('logins', blankLogin)}>
                  + Add
                </Button>
              </div>
              <div className="space-y-2">
                {form.logins.map((row, index) => (
                  <div key={`login-${index}`} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                    <input
                      value={row.label}
                      onChange={(e) => updateListRow('logins', index, 'label', e.target.value)}
                      placeholder="Label (e.g. Client admin)"
                      className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                    />
                    <input
                      value={row.username}
                      onChange={(e) => updateListRow('logins', index, 'username', e.target.value)}
                      placeholder="Username / Email"
                      autoComplete="username"
                      className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                    />
                    <input
                      type="password"
                      value={row.password}
                      onChange={(e) => updateListRow('logins', index, 'password', e.target.value)}
                      placeholder="Password"
                      autoComplete="new-password"
                      className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                    />
                    <Button type="button" variant="dangerGhost" size="sm" onClick={() => removeRow('logins', index, blankLogin)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-app-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Project Files</h3>
                <Button type="button" variant="secondary" size="sm" onClick={() => addRow('files', blankFile)}>
                  + Add
                </Button>
              </div>
              <div className="space-y-2">
                {form.files.map((row, index) => (
                  <div key={`file-${index}`} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <input
                      value={row.label}
                      onChange={(e) => updateListRow('files', index, 'label', e.target.value)}
                      placeholder="Label (e.g. Env file, Requirement doc)"
                      className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                    />
                    <input
                      type="file"
                      onChange={(e) => updateListRow('files', index, 'file', e.target.files?.[0] ?? null)}
                      className="h-10 w-full rounded-lg border border-app-border px-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-xs file:font-medium"
                    />
                    <Button type="button" variant="dangerGhost" size="sm" onClick={() => removeRow('files', index, blankFile)}>
                      Remove
                    </Button>
                    {row.file ? <p className="text-xs text-slate-500 sm:col-span-2">Selected: {row.file.name}</p> : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">Notes (optional)</h3>
              <textarea
                name="notes"
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional information..."
                rows={3}
                className="w-full rounded-lg border border-app-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
              />
            </section>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {success ? <p className="text-sm text-green-600">{success}</p> : null}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                Close
              </Button>
              <Button type="submit" disabled={isSubmitting || !hasAnyData}>
                <span className="inline-flex items-center gap-2">
                  {isSubmitting ? <Spinner size="sm" /> : null}
                  Save all
                </span>
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </ModalShell>
  )
}

export default CredentialsModal