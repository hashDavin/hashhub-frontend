import { useState, useEffect, useMemo } from 'react'
import { X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import ModalShell from '@/components/modals/ModalShell'
import { userService } from '@/services/userService'

function AssignUserModal({ open, onClose, onAssign, assignedUserIds = [], isSubmitting, loadingMembers = false }) {
  const [options, setOptions] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setSearch('')
    setSelected([])
    userService
      .list({ per_page: 100 })
      .then(({ items }) => {
        setOptions(items.filter((u) => !assignedUserIds.includes(u.id)))
      })
      .catch(() => setOptions([]))
      .finally(() => setLoading(false))
  }, [open, assignedUserIds.join(',')])

  const selectedUsers = useMemo(
    () => options.filter((u) => selected.includes(u.id)),
    [options, selected]
  )

  const availableOptions = useMemo(
    () => options.filter((u) => !selected.includes(u.id)),
    [options, selected]
  )

  const addUser = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const removeUser = (id) => {
    setSelected((prev) => prev.filter((x) => x !== id))
  }

  const filteredOptions = availableOptions.filter((u) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selected.length) onAssign(selected)
  }

  return (
    <ModalShell open={open} title="Assign members" onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">Select team members to assign to this project.</p>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team member by name or email"
            className="h-10 w-full rounded-lg border border-app-border px-3 pr-10 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-1 inline-flex w-8 items-center justify-center text-slate-400 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        {selectedUsers.length > 0 ? (
          <div className="min-h-[42px] rounded-lg border border-app-border bg-white p-2">
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((u) => (
                <span
                  key={`selected-${u.id}`}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand"
                >
                  {u.name}
                  <button
                    type="button"
                    onClick={() => removeUser(u.id)}
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-brand/20"
                    aria-label={`Remove ${u.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {loading || loadingMembers ? (
          <div className="flex h-36 items-center justify-center rounded-lg border border-app-border p-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <Spinner size="sm" />
              Loading team members...
            </span>
          </div>
        ) : (
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-app-border p-2">
            {filteredOptions.length === 0 ? (
              <p className="text-sm text-slate-500">No team members available to assign.</p>
            ) : (
              filteredOptions.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => addUser(u.id)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-slate-50"
                >
                  <span className="text-sm text-slate-800">
                    {u.name} <span className="text-slate-500">({u.email})</span>
                  </span>
                </button>
              ))
            )}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || selected.length === 0}>
            <span className="inline-flex items-center gap-2">
              {isSubmitting ? <Spinner size="sm" /> : null}
              Assign
            </span>
          </Button>
        </div>
      </form>
    </ModalShell>
  )
}

export default AssignUserModal
