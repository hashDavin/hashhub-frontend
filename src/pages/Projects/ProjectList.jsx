import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/common/PageHeader'
import ProjectTable from '@/components/projects/ProjectTable'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/notifications/ToastProvider'
import { projectService } from '@/services/projectService'
import { useProjectPermissions } from '@/hooks/useProjectPermissions'
import { getErrorMessage } from '@/utils/errorMessage'

let searchTimer

function ProjectList() {
  const navigate = useNavigate()
  const toast = useToast()
  const { canManageProjects } = useProjectPermissions()
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
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

  const handlePageChange = (page) => {
    load(page)
  }

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage projects and access."
        action={
          canManageProjects ? (
            <Button type="button" onClick={() => navigate('/projects/new')}>
              New project
            </Button>
          ) : null
        }
      />
      <ProjectTable
        projects={items}
        isLoading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        page={meta.current_page}
        lastPage={meta.last_page}
        total={meta.total}
        onPageChange={handlePageChange}
        canManage={canManageProjects}
        onEdit={(id) => navigate(`/projects/${id}/edit`)}
        onDelete={(row) => setDeleteTarget(row)}
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
    </div>
  )
}

export default ProjectList
