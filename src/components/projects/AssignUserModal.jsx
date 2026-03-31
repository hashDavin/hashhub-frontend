import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import ModalShell from '@/components/modals/ModalShell'
import { userService } from '@/services/userService'

function AssignUserModal({ open, onClose, onAssign, assignedUserIds = [], isSubmitting }) {
  const [options, setOptions] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selected.length) onAssign(selected)
  }

  return (
    <ModalShell open={open} title="Assign members" onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">Select users to add to this project.</p>
        {loading ? (
          <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
            <Spinner size="sm" />
            <span>Loading users…</span>
          </div>
        ) : (
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-app-border p-2">
            {options.length === 0 ? (
              <p className="text-sm text-slate-500">No users available to assign.</p>
            ) : (
              options.map((u) => (
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
