import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import DataTable from '@/components/tables/DataTable'
import Button from '@/components/ui/Button'
import { PROJECT_STATUS_OPTIONS } from '@/constants/project'

function statusLabel(value) {
  return PROJECT_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value
}

function ProjectTable({
  projects,
  isLoading,
  searchValue,
  onSearchChange,
  page,
  lastPage,
  total,
  onPageChange,
  canManage,
  onEdit,
  onDelete,
}) {
  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Project',
        render: (row) => (
          <Link to={`/projects/${row.id}`} className="font-medium text-slate-900 hover:text-brand">
            {row.name}
          </Link>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => (
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            {statusLabel(row.status)}
          </span>
        ),
      },
      {
        key: 'count',
        header: 'Assigned',
        render: (row) => (
          <span className="tabular-nums text-slate-600">{row.assigned_users_count ?? 0}</span>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        className: 'w-40',
        render: (row) =>
          canManage ? (
            <div className="flex justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onEdit(row.id)}
                title="Edit"
                aria-label={`Edit ${row.name}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="dangerGhost"
                size="icon"
                onClick={() => onDelete(row)}
                title="Delete"
                aria-label={`Delete ${row.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link
              to={`/projects/${row.id}`}
              className="text-sm font-medium text-brand hover:underline"
            >
              View
            </Link>
          ),
      },
    ],
    [canManage, onEdit, onDelete]
  )

  return (
    <DataTable
      title="Projects"
      columns={columns}
      rows={projects}
      isLoading={isLoading}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      emptyMessage="No projects found."
      pagination={{
        page,
        lastPage,
        total,
        onPageChange,
      }}
    />
  )
}

export default ProjectTable
