import { useMemo, useState } from 'react'
import PageHeader from '@/components/common/PageHeader'
import ProjectDetailsCard from '@/components/projects/ProjectDetailsCard'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import ModalShell from '@/components/modals/ModalShell'
import Button from '@/components/ui/Button'
import HashHubLoader from '@/components/common/HashHubLoader'
import { useProjectDetailsPage } from '@/hooks/useProjectDetailsPage'
import { useProjectPermissions } from '@/hooks/useProjectPermissions'
import { projectService } from '@/services/projectService'
import { getErrorMessage } from '@/utils/errorMessage'
import { Eye, Pencil, Trash2 } from 'lucide-react'

function parseCredentialTitle(rawTitle) {
  const title = String(rawTitle || '')
  const [groupTitle, ...rest] = title.split('::')
  return {
    groupTitle: groupTitle?.trim() || 'Untitled',
    rowLabel: rest.join('::').trim(),
  }
}

function ProjectDetails() {
  const { canManageProjects, canAddCredentials } = useProjectPermissions()
  const {
    navigate,
    project,
    members,
    credentials,
    loading,
    credLoading,
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
  const [viewGroup, setViewGroup] = useState(null)
  const [deleteGroup, setDeleteGroup] = useState(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const grouped = useMemo(() => {
    const m = new Map()
    credentials.forEach((row) => {
      const { groupTitle, rowLabel } = parseCredentialTitle(row.title)
      const entry = m.get(groupTitle) || { title: groupTitle, items: [], count: 0, updatedAt: row.updated_at }
      entry.items.push({
        ...row,
        rowLabel: rowLabel || row.title,
      })
      entry.count += 1
      entry.updatedAt = row.updated_at || entry.updatedAt
      m.set(groupTitle, entry)
    })
    return Array.from(m.values())
  }, [credentials])

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
        // action={
        //   <div className="flex flex-wrap gap-2">
        //     <Button type="button" variant="secondary" onClick={() => navigate('/projects')}>
        //       Back to list
        //     </Button>
        //   </div>
        // }
      />

      <ProjectDetailsCard
        project={project}
        onManageCredentials={canAddCredentials ? () => navigate(`/projects/${project.id}/credentials`) : undefined}
      />

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
          {canAddCredentials ? (
            <Button type="button" onClick={() => navigate(`/projects/${project.id}/credentials`)}>
              Add Project Credentials
            </Button>
          ) : null}
        </div>
        {grouped.length === 0 ? (
          <p className="rounded-xl border border-dashed border-app-border bg-app-card p-5 text-sm text-slate-500">
            No credential added yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-app-border bg-app-card shadow-card">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-app-border bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Last updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map((g) => (
                  <tr key={g.title} className="border-b border-app-border last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{g.title}</td>
                    <td className="px-4 py-3 text-slate-700">{g.count}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {g.updatedAt ? new Date(g.updatedAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="View"
                          aria-label={`View ${g.title}`}
                          onClick={() => navigate(`/projects/${project.id}/credentials/view?title=${encodeURIComponent(g.title)}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Edit"
                          aria-label={`Edit ${g.title}`}
                          onClick={() =>
                            navigate(`/projects/${project.id}/credentials?title=${encodeURIComponent(g.title)}`)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="dangerGhost"
                          size="icon"
                          title="Delete"
                          aria-label={`Delete ${g.title}`}
                          onClick={() => setDeleteGroup(g)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmationModal
        open={!!deleteGroup}
        title="Delete Credentials"
        message={deleteGroup ? `Remove all items under “${deleteGroup.title}”? This cannot be undone.` : ''}
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!deleteGroup) return
          setBulkDeleting(true)
          try {
            await Promise.all(
              deleteGroup.items.map((row) => projectService.deleteCredential(project.id, row.id))
            )
            setDeleteGroup(null)
            // Force refresh by navigating to same route
            navigate(0)
          } catch (err) {
            setDeleteGroup(null)
            alert(getErrorMessage(err, 'Failed to delete credential set.'))
          } finally {
            setBulkDeleting(false)
          }
        }}
        onCancel={() => {
          if (!bulkDeleting) setDeleteGroup(null)
        }}
        danger
        loading={bulkDeleting}
      />

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

      {/* view moved to dedicated page */}
    </div>
  )
}

export default ProjectDetails
