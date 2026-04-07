import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, Pencil, Trash2, UserPlus, KeyRound } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import DataTable from '@/components/tables/DataTable'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import ModalShell from '@/components/modals/ModalShell'
import ProjectForm from '@/components/projects/ProjectForm'
import AssignUserModal from '@/components/projects/AssignUserModal'
import Button from '@/components/ui/Button'
import StatusSwitch from '@/components/ui/StatusSwitch'
import { useToast } from '@/components/notifications/ToastProvider'
import { useProjectPermissions } from '@/hooks/useProjectPermissions'
import { projectService } from '@/services/projectService'
import { getErrorMessage } from '@/utils/errorMessage'
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useToggleProjectStatusMutation,
  useDeleteProjectMutation,
} from '@/store/hashHubApi'

let searchTimer

function ProjectList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()
  const { canManageProjects } = useProjectPermissions()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [assignTarget, setAssignTarget] = useState(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignSubmitting, setAssignSubmitting] = useState(false)
  const [assignMembersLoading, setAssignMembersLoading] = useState(false)
  const [assignedIds, setAssignedIds] = useState([])

  const perPage = 15

  const {
    data: listData,
    isLoading,
    isFetching,
    isError,
    error: listError,
    refetch,
  } = useGetProjectsQuery({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
  })

  const [createProject] = useCreateProjectMutation()
  const [updateProject] = useUpdateProjectMutation()
  const [toggleProjectStatus] = useToggleProjectStatusMutation()
  const [deleteProject] = useDeleteProjectMutation()

  useEffect(() => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(searchTimer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    if (isError && listError) {
      toast.error(getErrorMessage(listError, 'Failed to load projects.'))
    }
  }, [isError, listError, toast])

  const items = listData?.items ?? []
  const meta = listData?.meta ?? { current_page: 1, last_page: 1, total: 0, per_page: perPage }

  const loading = isLoading || isFetching

  useEffect(() => {
    const editId = searchParams.get('edit')
    if (!editId || !canManageProjects) return
    const target = items.find((p) => p.id === editId)
    if (target) {
      setEditTarget(target)
      const next = new URLSearchParams(searchParams)
      next.delete('edit')
      setSearchParams(next, { replace: true })
    }
  }, [canManageProjects, items, searchParams, setSearchParams])

  const rangeLabel = useMemo(() => {
    if (meta.total === 0) return '0-0 of 0'
    const start = (meta.current_page - 1) * perPage + 1
    const end = Math.min(meta.total, meta.current_page * perPage)
    return `${start}-${end} of ${meta.total}`
  }, [meta.current_page, meta.total, perPage])

  const projectColumns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Name',
        className: 'min-w-[180px]',
        render: (project) => (
          <p className="truncate font-semibold text-slate-900">{project.name}</p>
        ),
      },
      {
        key: 'description',
        header: 'Description',
        className: 'min-w-[260px]',
        render: (project) => (
          <p className="truncate text-slate-600">{project.description || 'No description'}</p>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        className: 'w-36',
        render: (project) => (
          <StatusSwitch
            checked={project.status === 'active'}
            disabled={!canManageProjects}
            onChange={async () => {
              try {
                const res = await toggleProjectStatus(project.id).unwrap()
                toast.success(res?.message || 'Project status updated.')
              } catch (err) {
                toast.error(getErrorMessage(err, 'Failed to update project status.'))
              }
            }}
            label={`Toggle status for ${project.name}`}
          />
        ),
      },
      {
        key: 'assigned',
        header: 'Assigned',
        className: 'w-28',
        render: (project) => (
          <span className="tabular-nums text-slate-700">{project.assigned_users_count ?? 0}</span>
        ),
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        className: 'w-40',
        thClassName: 'w-40',
        render: (project) => (
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => navigate(`/projects/${project.id}`)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-brand"
              aria-label={`View ${project.name}`}
            >
              <Eye className="h-4 w-4" />
            </button>
            {canManageProjects ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate(`/projects/${project.id}/credentials`)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-brand"
                  aria-label={`Manage credentials for ${project.name}`}
                >
                  <KeyRound className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setAssignTarget(project)
                    setAssignOpen(true)
                    setAssignMembersLoading(true)
                    try {
                      const { items: members } = await projectService.listMembers(project.id, { per_page: 100 })
                      setAssignedIds(members.map((u) => u.id))
                    } catch (err) {
                      setAssignedIds([])
                      toast.error(getErrorMessage(err, 'Failed to load assigned members.'))
                    } finally {
                      setAssignMembersLoading(false)
                    }
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-brand"
                  aria-label={`Assign members to ${project.name}`}
                >
                  <UserPlus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditTarget(project)
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-brand"
                  aria-label={`Edit ${project.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(project)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                  aria-label={`Delete ${project.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            ) : null}
          </div>
        ),
      },
    ],
    [canManageProjects, navigate, toggleProjectStatus, toast]
  )

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteProject(deleteTarget.id).unwrap()
      setDeleteTarget(null)
      toast.success('Project deleted successfully.')
      if (items.length === 1 && page > 1) {
        setPage(page - 1)
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete project.'))
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCreateProject = async (payload) => {
    setCreateSubmitting(true)
    try {
      const res = await createProject(payload).unwrap()
      const created = res.data
      toast.success('Project created successfully.')
      setOpenCreateModal(false)
      navigate(`/projects/${created.id}`)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create project.'))
    } finally {
      setCreateSubmitting(false)
    }
  }

  const handleEditProject = async (payload) => {
    if (!editTarget) return
    setEditSubmitting(true)
    try {
      await updateProject({ id: editTarget.id, body: payload }).unwrap()
      toast.success('Project updated successfully.')
      setEditTarget(null)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update project.'))
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleAssignMembers = async (userIds) => {
    if (!assignTarget) return
    setAssignSubmitting(true)
    try {
      await projectService.assignUsers(assignTarget.id, userIds)
      toast.success('Members assigned successfully.')
      setAssignOpen(false)
      setAssignTarget(null)
      setAssignedIds([])
      await refetch()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to assign members.'))
    } finally {
      setAssignSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search project',
        }}
        filters={{
          children: (
            <p className="text-sm text-slate-500">Additional project filters can be added here.</p>
          ),
        }}
        action={
          canManageProjects ? (
            <Button type="button" variant="primary" onClick={() => setOpenCreateModal(true)}>
              Create New
            </Button>
          ) : null
        }
      />
      <DataTable
        columns={projectColumns}
        rows={items}
        rowKey="id"
        isLoading={loading}
        emptyMessage="No projects found."
        footerPagination={{
          rangeLabel,
          canPrev: meta.current_page > 1 && !loading,
          canNext: meta.current_page < meta.last_page && !loading,
          onPrev: () => setPage((p) => Math.max(1, p - 1)),
          onNext: () => setPage((p) => p + 1),
        }}
      />
      <ConfirmationModal
        open={!!deleteTarget}
        title="Delete project"
        message={deleteTarget ? `Delete “${deleteTarget.name}”? This cannot be undone.` : ''}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleteLoading) setDeleteTarget(null)
        }}
        danger
        loading={deleteLoading}
      />
      <ModalShell
        open={openCreateModal}
        title="New project"
        onClose={() => (createSubmitting ? null : setOpenCreateModal(false))}
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setOpenCreateModal(false)}
          isSubmitting={createSubmitting}
        />
      </ModalShell>
      <ModalShell
        open={!!editTarget}
        title="Edit project"
        onClose={() => (editSubmitting ? null : setEditTarget(null))}
      >
        <ProjectForm
          initial={editTarget || {}}
          onSubmit={handleEditProject}
          onCancel={() => setEditTarget(null)}
          isSubmitting={editSubmitting}
          submitLabel="Save changes"
        />
      </ModalShell>
      <AssignUserModal
        open={assignOpen}
        onClose={() => {
          if (assignSubmitting) return
          setAssignOpen(false)
          setAssignTarget(null)
          setAssignedIds([])
          setAssignMembersLoading(false)
        }}
        onAssign={handleAssignMembers}
        assignedUserIds={assignedIds}
        isSubmitting={assignSubmitting}
        loadingMembers={assignMembersLoading}
      />
    </div>
  )
}

export default ProjectList
