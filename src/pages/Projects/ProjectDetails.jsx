import PageHeader from '@/components/common/PageHeader'
import ProjectDetailsCard from '@/components/projects/ProjectDetailsCard'
import CredentialList from '@/components/projects/CredentialList'
import CredentialForm from '@/components/projects/CredentialForm'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import ModalShell from '@/components/modals/ModalShell'
import Button from '@/components/ui/Button'
import HashHubLoader from '@/components/common/HashHubLoader'
import { useProjectDetailsPage } from '@/hooks/useProjectDetailsPage'
import { useProjectPermissions } from '@/hooks/useProjectPermissions'

function ProjectDetails() {
  const { canManageProjects, canAddCredentials, isSuperAdmin } = useProjectPermissions()
  const {
    navigate,
    project,
    members,
    credentials,
    loading,
    credLoading,
    credModal,
    setCredModal,
    credSubmitting,
    saveCredential,
    deleteCred,
    setDeleteCred,
    deleteCredLoading,
    confirmDeleteCred,
    deleteProject,
    setDeleteProject,
    deleteProjectLoading,
    confirmDeleteProject,
    memberToRemove,
    setMemberToRemove,
    removeMemberLoading,
    confirmRemoveMember,
  } = useProjectDetailsPage()

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500">
        <HashHubLoader />
      </div>
    )
  }

  if (!project) {
    return <p className="text-sm text-red-600">Project not found or access denied.</p>
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={project.name}
        description="Overview, members, and credentials."
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/projects')}>
              Back to list
            </Button>
            {/* {canManageProjects ? (
              <>
                <Button type="button" variant="danger" onClick={() => setDeleteProject(true)}>
                  Delete project
                </Button>
              </>
            ) : null} */}
          </div>
        }
      />

      <ProjectDetailsCard project={project} />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Assigned members</h2>
        </div>
        <ul className="divide-y divide-app-border rounded-xl border border-app-border bg-app-card">
          {members.length === 0 ? (
            <li className="px-4 py-6 text-sm text-slate-500">No members assigned.</li>
          ) : (
            members.map((u) => (
              <li key={u.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>
                  <span className="font-medium text-slate-900">{u.name}</span>{' '}
                  <span className="text-slate-500">({u.email})</span>
                </span>
                {canManageProjects ? (
                  <Button
                    type="button"
                    variant="dangerGhost"
                    size="sm"
                    onClick={() => setMemberToRemove(u)}
                  >
                    Remove
                  </Button>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Credentials</h2>
        </div>
        <CredentialList
          items={credentials}
          isLoading={credLoading}
          canManage={false}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      </section>

      {/* Credential editing is now managed from the list page. */}

      <ConfirmationModal
        open={!!deleteCred}
        title="Delete credential"
        message={deleteCred ? `Remove “${deleteCred.title}”? This cannot be undone.` : ''}
        confirmLabel="Delete"
        onConfirm={confirmDeleteCred}
        onCancel={() => {
          if (!deleteCredLoading) setDeleteCred(null)
        }}
        danger
        loading={deleteCredLoading}
      />

      <ConfirmationModal
        open={deleteProject}
        title="Delete project"
        message="Delete this project and related data? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDeleteProject}
        onCancel={() => {
          if (!deleteProjectLoading) setDeleteProject(false)
        }}
        danger
        loading={deleteProjectLoading}
      />

      <ConfirmationModal
        open={!!memberToRemove}
        title="Remove member"
        message={memberToRemove ? `Remove ${memberToRemove.name} from this project?` : ''}
        confirmLabel="Remove"
        onConfirm={confirmRemoveMember}
        onCancel={() => {
          if (!removeMemberLoading) setMemberToRemove(null)
        }}
        danger
        loading={removeMemberLoading}
      />
    </div>
  )
}

export default ProjectDetails
