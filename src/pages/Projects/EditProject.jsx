import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '@/components/common/PageHeader'
import ProjectForm from '@/components/projects/ProjectForm'
import Spinner from '@/components/ui/Spinner'
import { useToast } from '@/components/notifications/ToastProvider'
import { projectService } from '@/services/projectService'
import { getErrorMessage } from '@/utils/errorMessage'

function EditProject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [project, setProject] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    projectService
      .get(id)
      .then((data) => {
        if (!cancelled) setProject(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(true)
          toast.error(getErrorMessage(err, 'Failed to load project.'))
        }
      })
    return () => {
      cancelled = true
    }
  }, [id, toast])

  const handleSubmit = async (payload) => {
    setSubmitting(true)
    try {
      await projectService.update(id, payload)
      toast.success('Project updated successfully.')
      navigate(`/projects/${id}`, { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update project.'))
      setSubmitting(false)
    }
  }

  if (loadError) {
    return <p className="text-sm text-red-600">Project not found or access denied.</p>
  }

  if (!project) {
    return (
      <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-slate-500">
        <Spinner />
        <p className="text-sm">Loading…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader title="Edit project" description={project.name} />
      <div className="rounded-xl border border-app-border bg-app-card p-6 shadow-card">
        <ProjectForm
          initial={project}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/projects/${id}`)}
          isSubmitting={submitting}
          submitLabel="Save changes"
        />
      </div>
    </div>
  )
}

export default EditProject
