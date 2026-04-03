import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/constants/roles'
import PageHeader from '@/components/common/PageHeader'
import ModalShell from '@/components/modals/ModalShell'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import Button from '@/components/ui/Button'
import StatusSwitch from '@/components/ui/StatusSwitch'
import { useToast } from '@/components/notifications/ToastProvider'
import { getErrorMessage } from '@/utils/errorMessage'
import EmployeeFormModal from '@/components/users/EmployeeFormModal'
import DataTable from '@/components/tables/DataTable'
import {
  useGetUsersQuery,
  useToggleUserStatusMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '@/store/hashHubApi'

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

function avatarSrc(avatarUrl) {
  if (!avatarUrl) return null
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) return avatarUrl
  const base = import.meta.env.VITE_IMAGE_BASE_URL?.replace(/\/$/, '') || ''
  return `${base}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`
}

function UsersPage() {
  const toast = useToast()
  const { user } = useAuth()
  const canToggleStatus = user?.role === ROLES.SUPER_ADMIN
  const [page, setPage] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [avatarFilter, setAvatarFilter] = useState('all')
  const [openCreate, setOpenCreate] = useState(false)
  const [viewEmployee, setViewEmployee] = useState(null)
  const [editEmployee, setEditEmployee] = useState(null)
  const [deleteEmployee, setDeleteEmployee] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const hasAvatarParam = { all: undefined, with: 'with', without: 'without' }[avatarFilter]

  const {
    data: listData,
    isLoading,
    isFetching,
    isError,
    error: listError,
  } = useGetUsersQuery({
    page,
    per_page: 10,
    search: debouncedSearch.trim() || undefined,
    sort,
    has_avatar: hasAvatarParam,
  })

  const [toggleUserStatus] = useToggleUserStatusMutation()
  const [createUser] = useCreateUserMutation()
  const [updateUser] = useUpdateUserMutation()
  const [deleteUser] = useDeleteUserMutation()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, sort, avatarFilter])

  useEffect(() => {
    if (isError && listError) {
      toast.error(getErrorMessage(listError, 'Failed to load employees.'))
    }
  }, [isError, listError, toast])

  const employees = listData?.items ?? []
  const meta = listData?.meta ?? {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  }

  const loading = isLoading || isFetching

  const handleCreateEmployee = async (values) => {
    setError('')
    const payload = new FormData()
    payload.append('name', String(values.name || '').trim())
    payload.append('email', String(values.email || '').trim())
    payload.append('password', String(values.password || '').trim())
    setSaving(true)
    try {
      await createUser(payload).unwrap()
      toast.success('Team member added successfully.')
      setOpenCreate(false)
      setPage(1)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create team member.'))
    } finally {
      setSaving(false)
    }
  }

  const handleEditEmployee = async (values) => {
    if (!editEmployee) return
    setError('')
    const payload = new FormData()
    payload.append('name', String(values.name || '').trim())
    const nextEmail = String(values.email || '').trim()
    const currentEmail = String(editEmployee.email || '').trim()
    if (nextEmail && nextEmail.toLowerCase() !== currentEmail.toLowerCase()) {
      payload.append('email', nextEmail)
    }
    const password = String(values.password || '').trim()
    if (password) payload.append('password', password)
    setSaving(true)
    try {
      await updateUser({ id: editEmployee.id, body: payload }).unwrap()
      toast.success('Team member updated successfully.')
      setEditEmployee(null)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update team member.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEmployee = async () => {
    if (!deleteEmployee) return
    setDeleteLoading(true)
    try {
      await deleteUser(deleteEmployee.id).unwrap()
      toast.success('Team member deleted successfully.')
      setDeleteEmployee(null)
      if (employees.length === 1 && page > 1) {
        setPage(page - 1)
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete team member.'))
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleToggleStatus = useCallback(
    async (employee) => {
      if (!canToggleStatus) return
      try {
        const res = await toggleUserStatus(employee.id).unwrap()
        toast.success(res?.message || 'Team member status updated.')
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to update status.'))
      }
    },
    [canToggleStatus, toggleUserStatus, toast]
  )

  const rangeLabel = useMemo(() => {
    if (meta.total === 0) return '0-0 of 0'
    const start = (meta.current_page - 1) * meta.per_page + 1
    const end = Math.min(meta.total, meta.current_page * meta.per_page)
    return `${start}-${end} of ${meta.total}`
  }, [meta.current_page, meta.per_page, meta.total])

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (sort !== 'newest') n += 1
    if (avatarFilter !== 'all') n += 1
    return n
  }, [sort, avatarFilter])

  const handleClearFilters = () => {
    setSort('newest')
    setAvatarFilter('all')
  }

  const teamColumns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Name',
        className: 'min-w-[220px]',
        render: (employee) => {
          const src = avatarSrc(employee.avatar_url)
          return (
            <div className="flex items-center gap-3">
              {src ? (
                <img
                  src={src}
                  alt={employee.name}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
                  {getInitials(employee.name)}
                </div>
              )}
              <p className="truncate font-semibold text-slate-900">{employee.name}</p>
            </div>
          )
        },
      },
      {
        key: 'email',
        header: 'Email',
        className: 'min-w-[220px]',
        render: (row) => <span className="truncate text-slate-700">{row.email}</span>,
      },
      {
        key: 'projects_count',
        header: 'Projects Assigned',
        className: 'w-32',
        render: (row) => (
          <span className="tabular-nums text-slate-700">{row.projects_count ?? 0}</span>
        ),
      },
      {
        key: 'created_at',
        header: 'Created At',
        className: 'w-32',
        render: (row) => <span className="text-slate-700">{formatDate(row.created_at)}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        className: 'w-36',
        render: (employee) => (
          <StatusSwitch
            checked={Boolean(employee.is_active)}
            disabled={!canToggleStatus}
            onChange={() => handleToggleStatus(employee)}
            label={`Toggle status for ${employee.name}`}
          />
        ),
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        className: 'w-40',
        thClassName: 'w-40',
        render: (employee) => (
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => setEditEmployee(employee)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-brand"
              aria-label={`Edit ${employee.name}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteEmployee(employee)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
              aria-label={`Delete ${employee.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [canToggleStatus, handleToggleStatus]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search team member',
        }}
        filters={{
          children: (
            <div className="grid gap-4 sm:grid-cols-2">
              <label htmlFor="team-sort-filter" className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-600">Sort by joined</span>
                <select
                  id="team-sort-filter"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </label>
              <label htmlFor="team-photo-filter" className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-600">Photo</span>
                <select
                  id="team-photo-filter"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  value={avatarFilter}
                  onChange={(e) => setAvatarFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="with">With photo</option>
                  <option value="without">Without photo</option>
                </select>
              </label>
            </div>
          ),
          onClear: handleClearFilters,
          activeCount: activeFilterCount,
        }}
        action={
          <Button type="button" variant="primary" onClick={() => setOpenCreate(true)}>
            Create New
          </Button>
        }
      />

      <DataTable
        columns={teamColumns}
        rows={employees}
        rowKey="id"
        isLoading={loading}
        emptyMessage="No team members found."
        footerPagination={{
          rangeLabel,
          canPrev: meta.current_page > 1 && !loading,
          canNext: meta.current_page < meta.last_page && !loading,
          onPrev: () => setPage((p) => Math.max(1, p - 1)),
          onNext: () => setPage((p) => p + 1),
        }}
      />

      <EmployeeFormModal
        open={openCreate}
        mode="create"
        saving={saving}
        error={error}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreateEmployee}
      />

      <ModalShell
        open={!!viewEmployee}
        onClose={() => setViewEmployee(null)}
        title="Team member details"
      >
        {viewEmployee ? (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-slate-500">Name:</span> {viewEmployee.name}
            </p>
            <p>
              <span className="text-slate-500">Email:</span> {viewEmployee.email}
            </p>
            <p>
              <span className="text-slate-500">Role:</span> {viewEmployee.role?.replace('_', ' ')}
            </p>
            <p>
              <span className="text-slate-500">Projects:</span> {viewEmployee.projects_count ?? 0}
            </p>
            <p>
              <span className="text-slate-500">Joined:</span> {formatDate(viewEmployee.created_at)}
            </p>
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
        title="Delete Team Member"
        message={
          deleteEmployee ? `Delete ${deleteEmployee.name}? This action cannot be undone.` : ''
        }
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
