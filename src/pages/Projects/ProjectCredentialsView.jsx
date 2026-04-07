import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import PageHeader from '@/components/common/PageHeader'
import Button from '@/components/ui/Button'
import HashHubLoader from '@/components/common/HashHubLoader'
import { projectService } from '@/services/projectService'
import { getErrorMessage } from '@/utils/errorMessage'
import { useToast } from '@/components/notifications/ToastProvider'
import { ChevronDown, Copy as CopyIcon } from 'lucide-react'

function ProjectCredentialsView() {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const title = String(searchParams.get('title') || '').trim()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [project, setProject] = useState(null)
    const [groups, setGroups] = useState([])
    const [error, setError] = useState('')
    const toast = useToast()

    useEffect(() => {
        let mounted = true
        const load = async () => {
            setLoading(true)
            setError('')
            try {
                const [p, grouped] = await Promise.all([
                    projectService.get(id),
                    projectService.listCredentialsGrouped(id),
                ])
                if (!mounted) return
                setProject(p)
                setGroups(grouped.items || grouped.data || [])
            } catch (err) {
                if (!mounted) return
                setError(getErrorMessage(err, 'Failed to load credentials.'))
            } finally {
                if (mounted) setLoading(false)
            }
        }
        load().catch(() => { })
        return () => { mounted = false }
    }, [id])

    const items = useMemo(() => {
        const arr = Array.isArray(groups) ? groups : []
        if (!title) return arr
        return arr.filter((g) => g.title === title)
    }, [groups, title])

    const firstOpenKey = useMemo(() => {
        if (items.length === 0) return null
        if (items[0]?.repo?.length) return 'repo'
        if (items[0]?.server?.length) return 'server'
        if (items[0]?.login_credentials?.length) return 'login'
        if (items[0]?.files?.length) return 'files'
        if (items[0]?.notes) return 'notes'
        return null
    }, [items])
    const [openKey, setOpenKey] = useState(null)
    useEffect(() => {
        setOpenKey(firstOpenKey)
    }, [firstOpenKey])

    const copy = async (text, label = 'Copied') => {
        try {
            await navigator.clipboard.writeText(String(text ?? ''))
            toast.success(label)
        } catch {
            // best-effort; ignore
        }
    }
    const copyBtnStyle = {
        padding: '2px',
        background: '#3bc2db',
        color: 'white',
        border: '1px solid #3bc2db',
        borderRadius: '5px',
    }

    if (loading) {
        return (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500">
                <HashHubLoader />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title={title ? `View: ${title}` : 'Project credentials'}
                description={project ? project.name : ''}
            />

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            {items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-app-border bg-app-card p-5 text-sm text-slate-500">
                    No credentials found.
                </p>
            ) : (
                <div className="space-y-6">
                    {items.map((g) => (
                        <section key={g.title} className="space-y-4">
                            {/* <h2 className="text-lg font-semibold text-slate-900">{g.title}</h2> */}

                            {/* Repositories */}
                            {g.repo?.length ? (
                                <div className="overflow-hidden rounded-2xl border border-app-border bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setOpenKey(openKey === 'repo' ? null : 'repo')}
                                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-500">
                                                <ChevronDown className={`h-4 w-4 transition-transform ${openKey === 'repo' ? '' : '-rotate-90'}`} />
                                            </span>
                                            <span className="text-sm font-semibold text-slate-800">Repositories</span>
                                        </div>
                                    </button>
                                    {openKey === 'repo' ? (
                                        <ul className="border-t border-app-border">
                                            {g.repo.map((r, i) => (
                                                <li key={`r-${i}`} className="flex items-start justify-between gap-3 px-4 py-3 border-b last:border-0 border-app-border">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-slate-900">{r.label}</p>
                                                        {r.value ? (
                                                            <a href={r.value} target="_blank" rel="noreferrer" className="mt-1 block truncate text-sm text-brand hover:underline">
                                                                {r.value}
                                                            </a>
                                                        ) : <p className="text-sm text-slate-500">—</p>}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        title="Copy link"
                                                        aria-label="Copy link"
                                                        onClick={() => copy(r.value || '', 'Link copied')}
                                                        style={copyBtnStyle}
                                                        className="inline-flex items-center justify-center rounded"
                                                    >
                                                        <CopyIcon className="h-4 w-4" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </div>
                            ) : null}

                            {/* Servers */}
                            {g.server?.length ? (
                                <div className="overflow-hidden rounded-2xl border border-app-border bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setOpenKey(openKey === 'server' ? null : 'server')}
                                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-500">
                                                <ChevronDown className={`h-4 w-4 transition-transform ${openKey === 'server' ? '' : '-rotate-90'}`} />
                                            </span>
                                            <span className="text-sm font-semibold text-slate-800">Servers</span>
                                        </div>
                                    </button>
                                    {openKey === 'server' ? (
                                        <ul className="border-t border-app-border">
                                            {g.server.map((s, i) => (
                                                <li key={`s-${i}`} className="flex items-start justify-between gap-3 px-4 py-3 border-b last:border-0 border-app-border">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-slate-900">{s.label}</p>
                                                        {s.value ? (
                                                            <a href={s.value} target="_blank" rel="noreferrer" className="mt-1 block truncate text-sm text-brand hover:underline">
                                                                {s.value}
                                                            </a>
                                                        ) : <p className="text-sm text-slate-500">—</p>}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        title="Copy link"
                                                        aria-label="Copy link"
                                                        onClick={() => copy(s.value || '', 'Link copied')}
                                                        style={copyBtnStyle}
                                                        className="inline-flex items-center justify-center rounded"
                                                    >
                                                        <CopyIcon className="h-4 w-4" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </div>
                            ) : null}

                            {/* Login Credentials */}
                            {g.login_credentials?.length ? (
                                <div className="overflow-hidden rounded-2xl border border-app-border bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setOpenKey(openKey === 'login' ? null : 'login')}
                                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-500">
                                                <ChevronDown className={`h-4 w-4 transition-transform ${openKey === 'login' ? '' : '-rotate-90'}`} />
                                            </span>
                                            <span className="text-sm font-semibold text-slate-800">Login Credentials</span>
                                        </div>
                                    </button>
                                    {openKey === 'login' ? (
                                        <ul className="border-t border-app-border">
                                            {g.login_credentials.map((c, i) => (
                                                <li key={`c-${i}`} className="px-4 py-3 border-b last:border-0 border-app-border">
                                                    <p className="text-sm font-medium text-slate-900">{c.label}</p>
                                                    <div className="mt-2 space-y-2">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <p className="truncate text-sm text-slate-600">
                                                                <span className="font-medium text-slate-800">Username:</span>{' '}
                                                                <span className="text-slate-900">{c.value || '—'}</span>
                                                            </p>
                                                            <button
                                                                type="button"
                                                                title="Copy username"
                                                                aria-label="Copy username"
                                                                onClick={() => copy(c.value || '', 'Username copied')}
                                                                style={copyBtnStyle}
                                                                className="inline-flex items-center justify-center rounded"
                                                            >
                                                                <CopyIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <p className="truncate text-sm text-slate-600">
                                                                <span className="font-medium text-slate-800">Password:</span>{' '}
                                                                <span className="text-slate-900">{c.password || (c.password_set ? '********' : '—')}</span>
                                                            </p>
                                                            <button
                                                                type="button"
                                                                title="Copy password"
                                                                aria-label="Copy password"
                                                                onClick={() => copy(c.password || (c.password_set ? '********' : ''), 'Password copied')}
                                                                style={copyBtnStyle}
                                                                className="inline-flex items-center justify-center rounded"
                                                            >
                                                                <CopyIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </div>
                            ) : null}

                            {/* Files */}
                            {g?.files && g?.files?.length ? (
                                <div className="overflow-hidden rounded-2xl border border-app-border bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setOpenKey(openKey === 'files' ? null : 'files')}
                                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-500">
                                                <ChevronDown className={`h-4 w-4 transition-transform ${openKey === 'files' ? '' : '-rotate-90'}`} />
                                            </span>
                                            <span className="text-sm font-semibold text-slate-800">Project Files</span>
                                        </div>
                                    </button>
                                    {openKey === 'files' ? (
                                        <ul className="border-t border-app-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                            {g.files.map((f, i) => (
                                                <li
                                                    key={`f-${i}`}
                                                    className="rounded-xl border border-app-border bg-white p-4 hover:shadow-md transition-all"
                                                >
                                                    {/* File Info */}
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                                                            📄
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-900 truncate">
                                                            {f.label}
                                                        </p>
                                                    </div>

                                                    {/* Actions */}
                                                    {f.url ? (
                                                        <div className="flex items-center gap-2 mt-3">
                                                            {/* View */}
                                                            <a
                                                                href={f.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="flex-1 text-center text-sm font-medium px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                                            >
                                                                View & Download
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-slate-500 mt-2">No file available</p>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </div>
                            ) : null}

                            {/* Notes */}
                            {g.notes ? (
                                <div className="overflow-hidden rounded-2xl border border-app-border bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setOpenKey(openKey === 'notes' ? null : 'notes')}
                                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-500">
                                                <ChevronDown className={`h-4 w-4 transition-transform ${openKey === 'notes' ? '' : '-rotate-90'}`} />
                                            </span>
                                            <span className="text-sm font-semibold text-slate-800">Notes</span>
                                        </div>
                                    </button>
                                    {openKey === 'notes' ? (
                                        <div className="border-t border-app-border">
                                            <div className="flex items-start justify-between gap-3 px-4 py-3">
                                                <pre className="whitespace-pre-wrap break-words rounded-lg border border-app-border bg-white p-3 text-sm text-slate-800 w-full">
                                                    {g.notes}
                                                </pre>
                                                <div className="shrink-0 pl-2">
                                                    <button
                                                        type="button"
                                                        title="Copy notes"
                                                        aria-label="Copy notes"
                                                        onClick={() => copy(g.notes || '', 'Notes copied')}
                                                        style={copyBtnStyle}
                                                        className="inline-flex items-center justify-center rounded"
                                                    >
                                                        <CopyIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}
                        </section>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProjectCredentialsView
