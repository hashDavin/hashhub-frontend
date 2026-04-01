import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import HashHubLoader from '@/components/common/HashHubLoader'
import ModalShell from '@/components/modals/ModalShell'
import { userService } from '@/services/userService'

function AssignUserModal({ open, onClose, onAssign, assignedUserIds = [], isSubmitting }) {
  const [options, setOptions] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setSearch('')
    userService
      .list({ per_page: 100 })
      .then(({ items }) => {
        setOptions(items.filter((u) => !assignedUserIds.includes(u.id)))
      })
      .catch(() => setOptions([]))
      .finally(() => setLoading(false))
  }, [open, assignedUserIds.join(',')])

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const filteredOptions = options.filter((u) => {
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
        <p className="text-sm text-slate-600">Select users to add to this project.</p>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search user by name or email"
          className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
        />
        {loading ? (
          <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
            <HashHubLoader size="sm" label="Loading users..." />
          </div>
        ) : (
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-app-border p-2">
            {filteredOptions.length === 0 ? (
              <p className="text-sm text-slate-500">No users available to assign.</p>
            ) : (
              filteredOptions.map((u) => (
                <label
                  key={u.id}
                  htmlFor={`assign-user-${u.id}`}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50"
                >
                  <input
                    id={`assign-user-${u.id}`}
                    type="checkbox"
                    checked={selected.includes(u.id)}
                    onChange={() => toggle(u.id)}
                  />
                  <span className="text-sm text-slate-800">
                    {u.name} <span className="text-slate-500">({u.email})</span>
                  </span>
                </label>
              ))
            )}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || selected.length === 0}>
            {isSubmitting ? 'Assigning…' : 'Assign'}
          </Button>
        </div>
      </form>
    </ModalShell>
  )
}

export default AssignUserModal
