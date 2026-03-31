import { PROJECT_STATUS_OPTIONS } from '@/constants/project'

function statusLabel(value) {
  return PROJECT_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value
}

function ProjectDetailsCard({ project }) {
  if (!project) return null

  return (
    <section className="rounded-xl border border-app-border bg-app-card p-6 shadow-card">
      <h2 className="text-lg font-semibold text-slate-900">Project overview</h2>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Name</dt>
          <dd className="font-medium text-slate-900">{project.name}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Status</dt>
          <dd className="font-medium text-slate-900">{statusLabel(project.status)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-slate-500">Description</dt>
          <dd className="text-slate-700">{project.description || '—'}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Members</dt>
          <dd className="font-medium text-slate-900">{project.assigned_users_count ?? 0}</dd>
        </div>
      </dl>
    </section>
  )
}

export default ProjectDetailsCard
