import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, MoreVertical, Pencil, Trash2, X } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import EntityListCard from '@/components/common/EntityListCard'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import ModalShell from '@/components/modals/ModalShell'
import ProjectForm from '@/components/projects/ProjectForm'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/notifications/ToastProvider'
import { projectService } from '@/services/projectService'
import { useProjectPermissions } from '@/hooks/useProjectPermissions'
import { getErrorMessage } from '@/utils/errorMessage'

let searchTimer

function ProjectList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()
  const { canManageProjects } = useProjectPermissions()
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = useCallback(
    async (page = 1) => {
      setLoading(true)
      try {
        const { items: rows, meta: m } = await projectService.list({
          page,
          search: debouncedSearch || undefined,
        })
        setItems(rows)
        setMeta({
          current_page: m.current_page,
          last_page: m.last_page,
          total: m.total,
        })
      } catch (err) {
        setItems([])
        toast.error(getErrorMessage(err, 'Failed to load projects.'))
      } finally {
        setLoading(false)
      }
    },
    [debouncedSearch, toast]
  )

  useEffect(() => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(searchTimer)
  }, [search])

  useEffect(() => {
    load(1)
  }, [load])

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

  const handlePageChange = (page) => {
    load(page)
  }

  const rangeLabel = useMemo(() => {
    if (meta.total === 0) return '0-0 of 0'
    const perPage = 15
    const start = (meta.current_page - 1) * perPage + 1
    const end = Math.min(meta.total, meta.current_page * perPage)
    return `${start}-${end} of ${meta.total}`
  }, [meta.current_page, meta.total])

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await projectService.remove(deleteTarget.id)
      setDeleteTarget(null)
      toast.success('Project deleted successfully.')
      await load(meta.current_page)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete project.'))
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCreateProject = async (payload) => {
    setCreateSubmitting(true)
    try {
      const created = await projectService.create(payload)
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
      await projectService.update(editTarget.id, payload)
      toast.success('Project updated successfully.')
      setEditTarget(null)
      await load(meta.current_page)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update project.'))
    } finally {
      setEditSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage projects and access."
        action={
          canManageProjects ? (
            <Button type="button" onClick={() => setOpenCreateModal(true)}>
              New project
            </Button>
          ) : null
        }
      />
      <EntityListCard
        headers={['Project', 'Status', 'Assigned', 'Actions']}
        headerGridClass="grid-cols-[2.8fr_1fr_1fr_120px]"
        isLoading={loading}
        isEmpty={items.length === 0}
        emptyText="No projects found."
        rangeLabel={rangeLabel}
        canPrev={meta.current_page > 1 && !loading}
        canNext={meta.current_page < meta.last_page && !loading}
        onPrev={() => handlePageChange(meta.current_page - 1)}
        onNext={() => handlePageChange(meta.current_page + 1)}
        rows={items.map((project) => (
          <div
            key={project.id}
            className="grid grid-cols-[2.8fr_1fr_1fr_120px] items-center gap-3 rounded-2xl bg-white px-4 py-3"
          >
            <div>
              <p className="truncate text-sm font-semibold text-slate-900">{project.name}</p>
              <p className="truncate text-xs text-slate-500">{project.description || 'No description'}</p>
            </div>
            <span className="w-fit rounded-full border border-slate-300 px-2 py-0.5 text-xs text-slate-600">
              {project.status}
            </span>
            <p className="text-sm text-slate-700">{project.assigned_users_count ?? 0}</p>
            <div className="relative justify-self-end">
              <button
                type="button"
                onClick={() => setOpenMenuId((prev) => (prev === project.id ? null : project.id))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {openMenuId === project.id ? (
                <div className="absolute right-0 top-10 z-20 w-40 rounded-lg border border-app-border bg-white py-1 shadow-elevated">
                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/projects/${project.id}`)
                      setOpenMenuId(null)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Eye className="h-4 w-4" /> View
                  </button>
                  {canManageProjects ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditTarget(project)
                          setOpenMenuId(null)
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil className="h-4 w-4" /> Edit project
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget(project)
                          setOpenMenuId(null)
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" /> Delete project
                      </button>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      >
        <div className="flex items-center justify-end">
          <div className="relative">
            <input
              type="text"
              placeholder="Search project"
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
        </div>
      </EntityListCard>
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
    </div>
  )
}

export default ProjectList
