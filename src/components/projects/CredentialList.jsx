import { useState } from 'react'
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import HashHubLoader from '@/components/common/HashHubLoader'
import { CREDENTIAL_TYPE_OPTIONS } from '@/constants/project'

function typeLabel(value) {
  return CREDENTIAL_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value
}

function CredentialRow({ row, canManage, onEdit, onDelete }) {
  const [showSecret, setShowSecret] = useState(false)
  const hasSecret = row.password_set

  return (
    <tr className="border-b border-app-border last:border-0">
      <td className="px-4 py-3 font-medium text-slate-900">{row.title}</td>
      <td className="px-4 py-3 text-slate-600">{typeLabel(row.type)}</td>
      <td className="px-4 py-3 text-slate-700">{row.username || '—'}</td>
      <td className="px-4 py-3">
        {hasSecret ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-slate-700">
              {showSecret ? '•••••••• (stored securely)' : '••••••••'}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title={showSecret ? 'Hide' : 'Reveal'}
              aria-label={showSecret ? 'Hide password' : 'Show password'}
              onClick={() => setShowSecret((v) => !v)}
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {canManage ? (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onEdit(row)}
              title="Edit"
              aria-label={`Edit ${row.title}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="dangerGhost"
              size="icon"
              onClick={() => onDelete(row)}
              title="Delete"
              aria-label={`Delete ${row.title}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </td>
    </tr>
  )
}

function CredentialListBody({ items, isLoading, canManage, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <tr>
        <td colSpan={5} className="px-4 py-12 text-center">
          <div className="inline-flex flex-col items-center gap-2 text-slate-500">
            <HashHubLoader />
          </div>
        </td>
      </tr>
    )
  }
  if (items.length === 0) {
    return (
      <tr>
        <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
          No credentials found.
        </td>
      </tr>
    )
  }
  return items.map((row) => (
    <CredentialRow
      key={row.id}
      row={row}
      canManage={canManage}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  ))
}

function CredentialList({ items, isLoading, canManage, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-app-border bg-app-card shadow-card">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-app-border bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Username</th>
            <th className="px-4 py-3">Password</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <CredentialListBody
            items={items}
            isLoading={isLoading}
            canManage={canManage}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </tbody>
      </table>
    </div>
  )
}

export default CredentialList
