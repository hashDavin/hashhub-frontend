import Button from '@/components/ui/Button'
import TextInput from '@/components/forms/TextInput'
import { CREDENTIAL_TYPE_OPTIONS } from '@/constants/project'

function CredentialForm({ initial = {}, onSubmit, onCancel, isSubmitting }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    onSubmit({
      type: fd.get('type'),
      title: fd.get('title')?.trim(),
      username: fd.get('username')?.trim() || null,
      password: fd.get('password') || null,
      url: fd.get('url')?.trim() || null,
      notes: fd.get('notes')?.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="credential-type" className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Type</span>
        <select
          id="credential-type"
          name="type"
          defaultValue={initial.type ?? 'repo'}
          className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
        >
          {CREDENTIAL_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <TextInput
        id="ctitle"
        name="title"
        label="Title"
        placeholder="Label"
        defaultValue={initial.title}
      />
      <TextInput
        id="cuser"
        name="username"
        label="Username"
        placeholder="Optional"
        defaultValue={initial.username ?? ''}
      />
      <TextInput
        id="cpass"
        name="password"
        label="Password / secret"
        placeholder={initial.id ? 'Leave blank to keep current' : 'Optional'}
        type="password"
        autoComplete="new-password"
      />
      <TextInput
        id="curl"
        name="url"
        label="URL"
        placeholder="https://…"
        defaultValue={initial.url ?? ''}
      />
      <label htmlFor="credential-notes" className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Notes</span>
        <textarea
          id="credential-notes"
          name="notes"
          rows={3}
          defaultValue={initial.notes ?? ''}
          className="w-full rounded-lg border border-app-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
        />
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

export default CredentialForm
