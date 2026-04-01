import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye, Funnel, MoreVertical, Pencil, Trash2, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/constants/roles'
import PageHeader from '@/components/common/PageHeader'
import ModalShell from '@/components/modals/ModalShell'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import Button from '@/components/ui/Button'
import StatusSwitch from '@/components/ui/StatusSwitch'
import { useToast } from '@/components/notifications/ToastProvider'
import { userService } from '@/services/userService'
import { getErrorMessage } from '@/utils/errorMessage'
import EmployeeFormModal from '@/components/users/EmployeeFormModal'
import EntityListCard from '@/components/common/EntityListCard'

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString()
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const second = parts[1]?.[0] ?? ''
  return `${first}${second}`.toUpperCase() || 'NA'
}

function UsersPage() {
  const toast = useToast()
  const { user } = useAuth()
  const canToggleStatus = user?.role === ROLES.SUPER_ADMIN
  const [employees, setEmployees] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 10 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [avatarFilter, setAvatarFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [openCreate, setOpenCreate] = useState(false)
  const [viewEmployee, setViewEmployee] = useState(null)
  const [editEmployee, setEditEmployee] = useState(null)
  const [deleteEmployee, setDeleteEmployee] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadEmployees = useCallback(
    async (page = 1) => {
      setLoading(true)
      try {
        const { items, meta: pagination } = await userService.listEmployees({
          page,
          per_page: 10,
          search: debouncedSearch.trim() || undefined,
          sort,
          has_avatar: avatarFilter === 'all' ? undefined : avatarFilter === 'with',
        })
        setEmployees(items)
        setMeta({
          current_page: pagination.current_page,
          last_page: pagination.last_page,
          total: pagination.total,
          per_page: pagination.per_page ?? 10,
        })
      } catch (err) {
        setEmployees([])
        toast.error(getErrorMessage(err, 'Failed to load employees.'))
      } finally {
        setLoading(false)
      }
    },
    [avatarFilter, debouncedSearch, sort, toast]
  )

  useEffect(() => {
    loadEmployees(1)
  }, [loadEmployees])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [search])

  const handleCreateEmployee = async (e) => {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.target)
    const payload = new FormData()
    payload.append('name', String(fd.get('name') || ''))
    payload.append('email', String(fd.get('email') || ''))
    payload.append('password', String(fd.get('password') || ''))
    if (fd.get('avatar') instanceof File && fd.get('avatar')?.size > 0) {
      payload.append('avatar', fd.get('avatar'))
    }
    setSaving(true)
    try {
      await userService.createEmployee(payload)
      toast.success('Employee added successfully.')
      setOpenCreate(false)
      await loadEmployees(1)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create employee.'))
    } finally {
      setSaving(false)
    }
  }

  const handleEditEmployee = async (e) => {
    e.preventDefault()
    if (!editEmployee) return
    setError('')
    const fd = new FormData(e.target)
    const payload = new FormData()
    payload.append('name', String(fd.get('name') || ''))
    payload.append('email', String(fd.get('email') || ''))
    const password = String(fd.get('password') || '').trim()
    if (password) payload.append('password', password)
    payload.append('remove_avatar', fd.get('remove_avatar') ? '1' : '0')
    if (fd.get('avatar') instanceof File && fd.get('avatar')?.size > 0) {
      payload.append('avatar', fd.get('avatar'))
    }
    setSaving(true)
    try {
      await userService.updateEmployee(editEmployee.id, payload)
      toast.success('Employee updated successfully.')
      setEditEmployee(null)
      await loadEmployees(meta.current_page)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update employee.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEmployee = async () => {
    if (!deleteEmployee) return
    setDeleteLoading(true)
    try {
      await userService.deleteEmployee(deleteEmployee.id)
      toast.success('Employee deleted successfully.')
      setDeleteEmployee(null)
      const page = employees.length === 1 && meta.current_page > 1 ? meta.current_page - 1 : meta.current_page
      await loadEmployees(page)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete employee.'))
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleToggleStatus = async (employee) => {
    if (!canToggleStatus) return
    try {
      const response = await userService.toggleEmployeeStatus(employee.id)

      setEmployees((prev) =>
        prev.map((row) =>
          row.id === employee.id
            ? {
                ...row,
                is_active: !row.is_active,
              }
            : row
        )
      )
      toast.success(response?.data?.message || 'Employee status updated.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update status.'))
    }
  }

  const rangeLabel = useMemo(() => {
    if (meta.total === 0) return '0-0 of 0'
    const start = (meta.current_page - 1) * meta.per_page + 1
    const end = Math.min(meta.total, meta.current_page * meta.per_page)
    return `${start}-${end} of ${meta.total}`
  }, [meta.current_page, meta.per_page, meta.total])

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Employees (${meta.total})`}
        action={
          <Button type="button" onClick={() => setOpenCreate(true)} icon="arrowRight">
            Add Employee
          </Button>
        }
      />

      <EntityListCard
        headers={['Employees', 'Projects', 'Joined', 'Status',]}
        headerGridClass="grid-cols-[2.4fr_1fr_1fr_1fr_1fr_44px]"
        isLoading={loading}
        isEmpty={employees.length === 0}
        emptyText="No Employees found."
        rangeLabel={rangeLabel}
        canPrev={meta.current_page > 1 && !loading}
        canNext={meta.current_page < meta.last_page && !loading}
        onPrev={() => loadEmployees(meta.current_page - 1)}
        onNext={() => loadEmployees(meta.current_page + 1)}
        rows={employees.map((employee) => (
          <div
            key={employee.id}
            className="grid grid-cols-[2.4fr_1fr_1fr_1fr_1fr_44px] items-center gap-3 rounded-2xl bg-white px-4 py-3"
          >
            <div className="flex items-center gap-3">
              {employee.avatar_url ? (
                <img src={employee.avatar_url} alt={employee.name} className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                  {getInitials(employee.name)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{employee.name}</p>
                <p className="truncate text-xs text-slate-500">{employee.email}</p>
              </div>
            </div>
            <p className="text-sm text-slate-700">{employee.projects_count ?? 0}</p>
            <p className="text-sm text-slate-700">{formatDate(employee.created_at)}</p>
            <div className="flex items-center gap-2">
              <StatusSwitch
                checked={Boolean(employee.is_active)}
                disabled={!canToggleStatus}
                onChange={() => handleToggleStatus(employee)}
                label={`Toggle status for ${employee.name}`}
              />
              <span className={`text-xs font-medium ${employee.is_active ? 'text-emerald-700' : 'text-slate-500'}`}>
                {employee.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenuId((prev) => (prev === employee.id ? null : employee.id))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {openMenuId === employee.id ? (
                <div className="absolute right-0 top-10 z-20 w-36 rounded-lg border border-app-border bg-white py-1 shadow-elevated">
                  <button
                    type="button"
                    onClick={() => {
                      setViewEmployee(employee)
                      setOpenMenuId(null)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Eye className="h-4 w-4" /> View
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditEmployee(employee)
                      setOpenMenuId(null)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteEmployee(employee)
                      setOpenMenuId(null)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      >
        <div className="flex items-center justify-end">
          <div className="relative flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search employee"
                className="h-10 rounded-lg border border-app-border bg-white px-3 pr-9 text-sm outline-none focus:border-brand"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-app-border bg-white text-slate-600 hover:text-slate-900"
              aria-label="Toggle filters"
            >
              <Funnel className="h-4 w-4" />
            </button>
            {showFilters ? (
              <div className="absolute right-0 top-12 z-20 w-56 space-y-3 rounded-lg border border-app-border bg-white p-3 shadow-elevated">
                <label className="block space-y-1 text-xs text-slate-600">
                  <span>Sort by joined</span>
                  <select
                    className="h-9 w-full rounded-lg border border-app-border px-2 text-sm"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                </label>
                <label className="block space-y-1 text-xs text-slate-600">
                  <span>Photo</span>
                  <select
                    className="h-9 w-full rounded-lg border border-app-border px-2 text-sm"
                    value={avatarFilter}
                    onChange={(e) => setAvatarFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="with">With photo</option>
                    <option value="without">Without photo</option>
                  </select>
                </label>
              </div>
            ) : null}
          </div>
        </div>
      </EntityListCard>

      <EmployeeFormModal
        open={openCreate}
        mode="create"
        saving={saving}
        error={error}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreateEmployee}
      />

      <ModalShell open={!!viewEmployee} onClose={() => setViewEmployee(null)} title="Employee details">
        {viewEmployee ? (
          <div className="space-y-2 text-sm">
            <p><span className="text-slate-500">Name:</span> {viewEmployee.name}</p>
            <p><span className="text-slate-500">Email:</span> {viewEmployee.email}</p>
            <p><span className="text-slate-500">Role:</span> {viewEmployee.role?.replace('_', ' ')}</p>
            <p><span className="text-slate-500">Projects:</span> {viewEmployee.projects_count ?? 0}</p>
            <p><span className="text-slate-500">Joined:</span> {formatDate(viewEmployee.created_at)}</p>
          </div>
        ) : null}
      </ModalShell>

      <EmployeeFormModal
        open={!!editEmployee}
        mode="edit"
        employee={editEmployee}
        saving={saving}
        error={error}
        onClose={() => setEditEmployee(null)}
        onSubmit={handleEditEmployee}
      />

      <ConfirmationModal
        open={!!deleteEmployee}
        title="Delete Employee"
        message={deleteEmployee ? `Delete ${deleteEmployee.name}? This action cannot be undone.` : ''}
        onConfirm={handleDeleteEmployee}
        onCancel={() => (deleteLoading ? null : setDeleteEmployee(null))}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
      />
    </div>
  )
}

export default UsersPage
