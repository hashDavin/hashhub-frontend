import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import PageHeader from '@/components/common/PageHeader'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import HashHubLoader from '@/components/common/HashHubLoader'
import { useToast } from '@/components/notifications/ToastProvider'
import { useProjectPermissions } from '@/hooks/useProjectPermissions'
import { projectService } from '@/services/projectService'
import { getErrorMessage } from '@/utils/errorMessage'
import SvgIcon from '@/components/ui/SvgIcon'

const blankRepo = () => ({ label: '', url: '' })
const blankServer = () => ({ label: '', url: '' })
const blankLogin = () => ({ label: '', username: '', password: '' })
const blankFile = () => ({ label: '', file: null })

function splitTitle(rawTitle) {
  const title = String(rawTitle || '')
  const [groupTitle, ...rest] = title.split('::')
  return {
    groupTitle: groupTitle?.trim() || '',
    rowLabel: rest.join('::').trim(),
  }
}

function composeTitle(groupTitle, rowLabel) {
  return `${groupTitle.trim()} :: ${String(rowLabel || 'Entry').trim()}`
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(String(value || '').trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function ProjectCredentialsPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { canAddCredentials } = useProjectPermissions()
  const selectedTitle = String(searchParams.get('title') || '').trim()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState(null)
  const [allCredentials, setAllCredentials] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rowErrors, setRowErrors] = useState({})
  const [form, setForm] = useState({
    groupTitle: selectedTitle,
    repositories: [blankRepo()],
    servers: [blankServer()],
    logins: [blankLogin()],
    files: [blankFile()],
    notes: '',
  })

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const [projectRes, credRes] = await Promise.all([
          projectService.get(id),
          projectService.listCredentials(id, { per_page: 200 }),
        ])
        if (!mounted) return
        setProject(projectRes)
        setAllCredentials(credRes.items)
      } catch (err) {
        if (!mounted) return
        toast.error(getErrorMessage(err, 'Failed to load credential page.'))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load().catch(() => {})
    return () => {
      mounted = false
    }
  }, [id, toast])

  const matchingCredentials = useMemo(() => {
    if (!form.groupTitle.trim()) return []
    return allCredentials.filter((row) => splitTitle(row.title).groupTitle === form.groupTitle.trim())
  }, [allCredentials, form.groupTitle])

  useEffect(() => {
    if (!selectedTitle || allCredentials.length === 0) return
    const rows = allCredentials.filter((row) => splitTitle(row.title).groupTitle === selectedTitle)
    const repos = []
    const servers = []
    const logins = []
    const files = []
    let commonNotes = ''
    rows.forEach((row) => {
      const { rowLabel } = splitTitle(row.title)
      if (row.type === 'repo') repos.push({ label: rowLabel || 'Repository', url: row.url || '' })
      if (row.type === 'server') servers.push({ label: rowLabel || 'Server', url: row.url || '' })
      if (row.type === 'login')
        logins.push({
          label: rowLabel || 'Login',
          username: row.username || '',
          // show existing password if available; otherwise keep empty (will preserve existing on save if blank)
          password: typeof row.password === 'string' ? row.password : '',
        })
      if (row.type === 'api' && row.url) {
        // treat api with URL as stored file entry
        const filename = row.url.split('/').pop() || 'File'
        files.push({ label: rowLabel || filename, file: null, existingUrl: row.url })
      }
      if (!commonNotes && typeof row.notes === 'string' && row.notes.trim()) {
        commonNotes = row.notes
      }
    })
    setForm((prev) => ({
      ...prev,
      groupTitle: selectedTitle,
      repositories: repos.length ? repos : [blankRepo()],
      servers: servers.length ? servers : [blankServer()],
      logins: logins.length ? logins : [blankLogin()],
      files: files.length ? files : [blankFile()],
      notes: commonNotes,
    }))
  }, [allCredentials, selectedTitle])

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
    setRowErrors((prev) => {
      const next = { ...prev }
      delete next[`${section}-${index}`]
      delete next[`${section}-${index}-label`]
      delete next[`${section}-${index}-url`]
      delete next[`${section}-${index}-username`]
      delete next[`${section}-${index}-file`]
      return next
    })
  }

  const addRow = (section, createBlankRow) => {
    setForm((prev) => ({ ...prev, [section]: [...prev[section], createBlankRow()] }))
  }

  const removeRow = (section, index, createBlankRow) => {
    setForm((prev) => {
      const nextRows = prev[section].filter((_, idx) => idx !== index)
      return { ...prev, [section]: nextRows.length ? nextRows : [createBlankRow()] }
    })
    setRowErrors((prev) => {
      const next = { ...prev }
      delete next[`${section}-${index}`]
      delete next[`${section}-${index}-label`]
      delete next[`${section}-${index}-url`]
      delete next[`${section}-${index}-username`]
      delete next[`${section}-${index}-file`]
      return next
    })
  }

  const validatePairs = () => {
    const errors = {}
    form.repositories.forEach((row, index) => {
      const label = (row.label || '').trim()
      const value = (row.url || '').trim()
      if (label && !value) errors[`repositories-${index}-url`] = 'Repository URL is required.'
      if (!label && value) errors[`repositories-${index}-label`] = 'Label is required.'
      if (value && !isValidHttpUrl(value)) {
        errors[`repositories-${index}-url`] = 'Enter a valid URL (http:// or https://).'
      }
    })
    form.servers.forEach((row, index) => {
      const label = (row.label || '').trim()
      const value = (row.url || '').trim()
      if (label && !value) errors[`servers-${index}-url`] = 'Server URL is required.'
      if (!label && value) errors[`servers-${index}-label`] = 'Label is required.'
      if (value && !isValidHttpUrl(value)) {
        errors[`servers-${index}-url`] = 'Enter a valid URL (http:// or https://).'
      }
    })
    form.logins.forEach((row, index) => {
      const label = (row.label || '').trim()
      const value = (row.username || '').trim()
      if (label && !value) errors[`logins-${index}-username`] = 'Username is required.'
      if (!label && value) errors[`logins-${index}-label`] = 'Label is required.'
    })
    form.files.forEach((row, index) => {
      const label = (row.label || '').trim()
      const hasFileValue = row.file instanceof File || Boolean((row.existingUrl || '').trim())
      if (label && !hasFileValue) errors[`files-${index}-file`] = 'File is required.'
      if (!label && hasFileValue) errors[`files-${index}-label`] = 'Label is required.'
    })
    return errors
  }

  const pushIfComplete = (items, row, toPayload) => {
    const payload = toPayload(row)
    const hasContent = payload instanceof FormData
      ? payload.has('attachment')
      : Object.values(payload).some((value) => typeof value === 'string' && value.trim().length > 0)
    if (!hasContent) return
    items.push(payload)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const pairErrors = validatePairs()
    if (Object.keys(pairErrors).length > 0) {
      setRowErrors(pairErrors)
      return
    }
    setRowErrors({})
    const groupTitle = form.groupTitle.trim()
    if (!groupTitle) {
      setError('Please add a credential title (for example: Dev Server).')
      return
    }
    if (!hasAnyData) {
      setError('Add at least one repository, server, login, or file entry.')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')
    try {
      const commonNotes = form.notes.trim()

      const fd = new FormData()
      fd.append('group_title', groupTitle)
      if (selectedTitle && selectedTitle !== groupTitle) {
        fd.append('previous_group_title', selectedTitle)
      }
      fd.append('replace', '1')
      if (commonNotes) fd.append('notes', commonNotes)

      // repos
      let idx = 0
      form.repositories.forEach((row) => {
        const has = Boolean((row.label || '').trim() || (row.url || '').trim())
        if (!has) return
        fd.append(`repo[${idx}][label]`, row.label || 'Repository')
        if (row.url) fd.append(`repo[${idx}][value]`, row.url)
        idx += 1
      })

      // servers
      idx = 0
      form.servers.forEach((row) => {
        const has = Boolean((row.label || '').trim() || (row.url || '').trim())
        if (!has) return
        fd.append(`server[${idx}][label]`, row.label || 'Server')
        if (row.url) fd.append(`server[${idx}][value]`, row.url)
        idx += 1
      })

      // logins
      idx = 0
      form.logins.forEach((row) => {
        const has = Boolean((row.label || '').trim() || (row.username || '').trim() || (row.password || '').trim())
        if (!has) return
        fd.append(`login_credentials[${idx}][label]`, row.label || 'Login')
        if (row.username) fd.append(`login_credentials[${idx}][value]`, row.username)
        if (row.password) fd.append(`login_credentials[${idx}][password]`, row.password)
        idx += 1
      })

      // files
      idx = 0
      form.files.forEach((row) => {
        const has = Boolean((row.label || '').trim() || row.file instanceof File)
        if (!has) return
        fd.append(`files[${idx}][label]`, row.label || 'File')
        if (row.file instanceof File) {
          fd.append(`files[${idx}][file]`, row.file)
        } else if (row.existingUrl) {
          // Preserve current file when replacing entire set
          fd.append(`files[${idx}][url]`, row.existingUrl)
        }
        idx += 1
      })

      await projectService.createCredentialBulk(id, fd)
      setSuccess('Credential set saved successfully.')
      toast.success('Credential set saved successfully.')
      navigate(`/projects/${id}`, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save credential set.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div>
        <HashHubLoader />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={selectedTitle ? 'Edit Project Credentials' : 'Add Project Credentials'}
        description={project ? `${project.name} - create grouped credentials.` : 'Create grouped credentials.'}
      />

      {!canAddCredentials ? (
        <p className="rounded-xl border border-dashed border-app-border bg-app-card p-5 text-sm text-slate-500">
          You do not have permission to add credentials.
        </p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-6 rounded-xl bg-app-card">
          <section className="space-y-2">
            <h3 className="text-xs font-medium tracking-wide text-slate-500">Credential Title</h3>
            <input
              value={form.groupTitle}
              onChange={(e) => setForm((prev) => ({ ...prev, groupTitle: e.target.value }))}
              placeholder="e.g. Dev Server, Live Server, Client Admin"
              className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
            />
          </section>

          <section className="rounded-xl border border-app-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Repositories</h3>
              <Button type="button" variant="secondary" size="sm" onClick={() => addRow('repositories', blankRepo)}>
                + Add
              </Button>
            </div>
            <div className="space-y-2">
              {form.repositories.map((row, index) => (
                <div key={`repo-${index}`}>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <div>
                      <input
                        value={row.label}
                        onChange={(e) => updateListRow('repositories', index, 'label', e.target.value)}
                        placeholder="Label (e.g. Frontend repo)"
                        className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                      />
                      {rowErrors[`repositories-${index}-label`] ? (
                        <p className="mt-1 text-xs text-red-600">{rowErrors[`repositories-${index}-label`]}</p>
                      ) : null}
                    </div>
                    <div>
                      <input
                        value={row.url}
                        onChange={(e) => updateListRow('repositories', index, 'url', e.target.value)}
                        placeholder="Repository URL"
                        type="text"
                        className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                      />
                      {rowErrors[`repositories-${index}-url`] ? (
                        <p className="mt-1 text-xs text-red-600">{rowErrors[`repositories-${index}-url`]}</p>
                      ) : null}
                    </div>
                    <Button type="button" variant="dangerGhost" className={"bg-red-100"} size="sm" onClick={() => removeRow('repositories', index, blankRepo)} icon="trash">
                    </Button>
                  </div>
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
                <div key={`server-${index}`}>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <div>
                      <input
                        value={row.label}
                        onChange={(e) => updateListRow('servers', index, 'label', e.target.value)}
                        placeholder="Label (e.g. Admin panel)"
                        className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                      />
                      {rowErrors[`servers-${index}-label`] ? (
                        <p className="mt-1 text-xs text-red-600">{rowErrors[`servers-${index}-label`]}</p>
                      ) : null}
                    </div>
                    <div>
                      <input
                        value={row.url}
                        onChange={(e) => updateListRow('servers', index, 'url', e.target.value)}
                        placeholder="Server URL"
                        type="text"
                        className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                      />
                      {rowErrors[`servers-${index}-url`] ? (
                        <p className="mt-1 text-xs text-red-600">{rowErrors[`servers-${index}-url`]}</p>
                      ) : null}
                    </div>
                    <Button type="button" variant="dangerGhost" className={"bg-red-100"} size="sm" onClick={() => removeRow('servers', index, blankServer)} icon="trash">
                    </Button>
                  </div>
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
                <div key={`login-${index}`}>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                    <div>
                      <input
                        value={row.label}
                        onChange={(e) => updateListRow('logins', index, 'label', e.target.value)}
                        placeholder="Label (e.g. Client admin)"
                        className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                      />
                      {rowErrors[`logins-${index}-label`] ? (
                        <p className="mt-1 text-xs text-red-600">{rowErrors[`logins-${index}-label`]}</p>
                      ) : null}
                    </div>
                    <div>
                      <input
                        value={row.username}
                        onChange={(e) => updateListRow('logins', index, 'username', e.target.value)}
                        placeholder="Username / Email"
                        autoComplete="username"
                        className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                      />
                      {rowErrors[`logins-${index}-username`] ? (
                        <p className="mt-1 text-xs text-red-600">{rowErrors[`logins-${index}-username`]}</p>
                      ) : null}
                    </div>
                    <input
                      type="text"
                      value={row.password}
                      onChange={(e) => updateListRow('logins', index, 'password', e.target.value)}
                      placeholder="Password (leave blank to keep unchanged)"
                      autoComplete="new-password"
                      className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                    />
                    <Button type="button" variant="dangerGhost" className={"bg-red-100"} size="sm" onClick={() => removeRow('logins', index, blankLogin)} icon="trash">
                    </Button>
                  </div>
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
                <div key={`file-${index}`}>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <div>
                      <input
                        value={row.label}
                        onChange={(e) => updateListRow('files', index, 'label', e.target.value)}
                        placeholder="Label (e.g. Env file, Requirement doc)"
                        className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                      />
                      {rowErrors[`files-${index}-label`] ? (
                        <p className="mt-1 text-xs text-red-600">{rowErrors[`files-${index}-label`]}</p>
                      ) : null}
                    </div>
                    {(() => {
                      const inputId = `file-input-${index}`
                      const hasExisting = Boolean(row.existingUrl)
                      const hasNew = row.file instanceof File
                      const labelText = hasNew ? row.file?.name : hasExisting ? 'Change file' : 'Choose file'
                      return (
                        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                          <div className="min-w-0">
                            <input
                              id={inputId}
                              type="file"
                              onChange={(e) => updateListRow('files', index, 'file', e.target.files?.[0] ?? null)}
                              className="hidden"
                            />
                            <label
                              htmlFor={inputId}
                              className="flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-app-border bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                              title={hasNew ? row.file?.name : undefined}
                            >
                              <span className="truncate">{labelText}</span>
                              <SvgIcon name="upload" className="ml-2 h-4 w-4 text-slate-500" />
                            </label>
                            {rowErrors[`files-${index}-file`] ? (
                              <p className="mt-1 text-xs text-red-600">{rowErrors[`files-${index}-file`]}</p>
                            ) : null}
                          </div>
                          {hasExisting ? (
                            <a
                              href={row.existingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-10 items-center justify-center rounded-lg border border-app-border bg-white px-3 text-sm font-medium text-brand hover:bg-slate-50 hover:underline"
                              title="Open current file"
                            >
                              View file
                            </a>
                          ) : (
                            <span className="inline-flex h-10 items-center justify-center rounded-lg px-2 text-sm text-slate-400">
                              No file
                            </span>
                          )}
                        </div>
                      )
                    })()}
                    <Button type="button" variant="dangerGhost" size="sm" onClick={() => removeRow('files', index, blankFile)} className={"bg-red-100"} icon="trash">
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">Notes (optional)</h3>
            <textarea
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
            <Button type="button" variant="secondary" onClick={() => navigate(`/projects/${id}`)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !hasAnyData || !form.groupTitle.trim()}>
              <span className="inline-flex items-center gap-2">
                {isSubmitting ? <Spinner size="sm" /> : null}
                Save
              </span>
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default ProjectCredentialsPage
