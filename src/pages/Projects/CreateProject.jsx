import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/common/PageHeader'
import ProjectForm from '@/components/projects/ProjectForm'
import { useToast } from '@/components/notifications/ToastProvider'
import { projectService } from '@/services/projectService'
import { getErrorMessage } from '@/utils/errorMessage'

function CreateProject() {
  const navigate = useNavigate()
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (payload) => {
    setSubmitting(true)
    try {
      const created = await projectService.create(payload)
      toast.success('Project created successfully.')
      navigate(`/projects/${created.id}`, { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create project.'))
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        title="New project"
        description="Create a project and assign members from the project page."
      />
      <div className="rounded-xl border border-app-border bg-app-card p-6 shadow-card">
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/projects')}
          isSubmitting={submitting}
        />
      </div>
    </div>
  )
}

export default CreateProject
