import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import TextInput from '@/components/forms/TextInput'

function ProjectForm({ initial = {}, onSubmit, onCancel, submitLabel = 'Save', isSubmitting }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    onSubmit({
      name: fd.get('name')?.trim(),
      description: fd.get('description')?.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextInput
        id="name"
        name="name"
        label="Name"
        placeholder="Project name"
        defaultValue={initial.name}
      />
      <label htmlFor="project-description" className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Description</span>
        <textarea
          id="project-description"
          name="description"
          rows={4}
          defaultValue={initial.description ?? ''}
          className="w-full rounded-lg border border-app-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
          placeholder="Optional"
        />
      </label>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          <span className="inline-flex items-center gap-2">
            {isSubmitting ? <Spinner size="sm" /> : null}
            {submitLabel}
          </span>
        </Button>
      </div>
    </form>
  )
}

export default ProjectForm
