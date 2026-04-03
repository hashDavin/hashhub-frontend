import { useState } from 'react'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import TextInput from '@/components/forms/TextInput'
import { CREDENTIAL_TYPE_OPTIONS } from '@/constants/project'

function appendIfPresent(fd, key, value) {
  const text = typeof value === 'string' ? value.trim() : value
  if (text) fd.append(key, text)
}

const QUICK_PRESETS = [
  { label: 'GitHub', type: 'github', title: 'GitHub Access' },
  { label: 'Vercel', type: 'vercel', title: 'Vercel Deployment' },
  { label: 'Render', type: 'render', title: 'Render Deployment' },
  { label: 'Env', type: 'env', title: 'Environment Config' },
  { label: 'Live URL', type: 'live_url', title: 'Production URL' },
]

function CredentialForm({ initial = {}, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState({
    type: initial.type ?? 'repository',
    title: initial.title ?? '',
    username: initial.username ?? '',
    password: '',
    url: initial.url ?? '',
    repo_url: initial.repo_url ?? '',
    live_url: initial.live_url ?? '',
    dev_url: initial.dev_url ?? '',
    dev_username: initial.dev_username ?? '',
    dev_password: '',
    notes: initial.notes ?? '',
    metadata_json: initial.metadata ? JSON.stringify(initial.metadata, null, 2) : '',
    remove_requirement_doc: false,
    remove_env_file: false,
  })
  const [requirementDocFile, setRequirementDocFile] = useState(null)
  const [envFile, setEnvFile] = useState(null)

  const patchForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const applyPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      type: preset.type,
      title: prev.title || preset.title,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = new FormData()

    appendIfPresent(payload, 'type', form.type)
    appendIfPresent(payload, 'title', form.title)
    appendIfPresent(payload, 'username', form.username)
    appendIfPresent(payload, 'password', form.password)
    appendIfPresent(payload, 'url', form.url)
    appendIfPresent(payload, 'repo_url', form.repo_url)
    appendIfPresent(payload, 'live_url', form.live_url)
    appendIfPresent(payload, 'dev_url', form.dev_url)
    appendIfPresent(payload, 'dev_username', form.dev_username)
    appendIfPresent(payload, 'dev_password', form.dev_password)
    appendIfPresent(payload, 'notes', form.notes)

    const metadataText = String(form.metadata_json || '').trim()
    if (metadataText) {
      try {
        const parsed = JSON.parse(metadataText)
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([key, value]) => {
            payload.append(`metadata[${key}]`, String(value ?? ''))
          })
        }
      } catch {
        payload.append('metadata[raw]', metadataText)
      }
    }

    if (requirementDocFile instanceof File && requirementDocFile.size > 0) {
      payload.append('requirement_doc', requirementDocFile)
    }
    if (envFile instanceof File && envFile.size > 0) {
      payload.append('env_file', envFile)
    }
    if (form.remove_requirement_doc) payload.append('remove_requirement_doc', '1')
    if (form.remove_env_file) payload.append('remove_env_file', '1')

    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="rounded-lg border border-app-border bg-slate-50 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Quick presets</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.type}
              type="button"
              onClick={() => applyPreset(preset)}
              className="rounded-full border border-app-border bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <label htmlFor="credential-type" className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Type (anything)</span>
        <input
          id="credential-type"
          name="type"
          value={form.type}
          onChange={(e) => patchForm('type', e.target.value)}
          list="credential-type-options"
          placeholder="e.g. github, vercel, render, env, requirement-doc"
          className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
        />
        <datalist id="credential-type-options">
          {CREDENTIAL_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} />
          ))}
        </datalist>
      </label>
      <TextInput
        id="ctitle"
        name="title"
        label="Title"
        placeholder="Label"
        defaultValue={undefined}
        value={form.title}
        onChange={(e) => patchForm('title', e.target.value)}
      />
      {/* <TextInput
        id="cuser"
        name="username"
        label="Username"
        placeholder="Optional"
        defaultValue={undefined}
        value={form.username}
        onChange={(e) => patchForm('username', e.target.value)}
      />
      <TextInput
        id="cpass"
        name="password"
        label="Password / secret"
        placeholder={initial.id ? 'Leave blank to keep current' : 'Optional'}
        type="password"
        autoComplete="new-password"
        defaultValue={undefined}
        value={form.password}
        onChange={(e) => patchForm('password', e.target.value)}
      />
      <TextInput
        id="curl"
        name="url"
        label="Primary URL"
        placeholder="https://…"
        defaultValue={undefined}
        value={form.url}
        onChange={(e) => patchForm('url', e.target.value)}
      /> */}

      <details className="rounded-lg border border-app-border bg-slate-50 p-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">Platform URLs</summary>
        <div className="mt-3 space-y-3">
          <TextInput
            id="repo-url"
            name="repo_url"
            label="Repository URL"
            placeholder="https://github.com/org/repo"
            defaultValue={undefined}
            value={form.repo_url}
            onChange={(e) => patchForm('repo_url', e.target.value)}
          />
          <TextInput
            id="live-url"
            name="live_url"
            label="Live URL"
            placeholder="https://app.example.com"
            defaultValue={undefined}
            value={form.live_url}
            onChange={(e) => patchForm('live_url', e.target.value)}
          />
          <TextInput
            id="dev-url"
            name="dev_url"
            label="Dev/Staging URL"
            placeholder="https://dev.example.com"
            defaultValue={undefined}
            value={form.dev_url}
            onChange={(e) => patchForm('dev_url', e.target.value)}
          />
        </div>
      </details>

      <details className="rounded-lg border border-app-border bg-slate-50 p-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">Credentials</summary>
        <div className="mt-3 space-y-3">
          <TextInput
            id="dev-user"
            name="dev_username"
            label="Username/Email"
            placeholder="Optional"
            defaultValue={undefined}
            value={form.dev_username}
            onChange={(e) => patchForm('dev_username', e.target.value)}
          />
          <TextInput
            id="dev-pass"
            name="dev_password"
            label="Password / Secret"
            placeholder={initial.id ? 'Leave blank to keep current' : 'Optional'}
            type="password"
            autoComplete="new-password"
            defaultValue={undefined}
            value={form.dev_password}
            onChange={(e) => patchForm('dev_password', e.target.value)}
          />
          {/* <label htmlFor="metadata-json" className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Extra details (JSON / notes)</span>
            <textarea
              id="metadata-json"
              name="metadata_json"
              rows={3}
              value={form.metadata_json}
              onChange={(e) => patchForm('metadata_json', e.target.value)}
              placeholder='{"platform":"vercel","team":"frontend"}'
              className="w-full rounded-lg border border-app-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
            />
          </label> */}
        </div>
      </details>

      <details className="rounded-lg border border-app-border bg-slate-50 p-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">Project files (doc/env)</summary>
        <div className="mt-3 space-y-3">
          <label htmlFor="requirement-doc" className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Requirement document</span>
            <input
              id="requirement-doc"
              name="requirement_doc"
              type="file"
              onChange={(e) => setRequirementDocFile(e.target.files?.[0] ?? null)}
              className="block w-full rounded-lg border border-app-border px-3 py-2 text-sm"
            />
            {requirementDocFile ? <p className="text-xs text-slate-500">Selected: {requirementDocFile.name}</p> : null}
          </label>
          <label htmlFor="env-file" className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Environment file (.env etc.)</span>
            <input
              id="env-file"
              name="env_file"
              type="file"
              onChange={(e) => setEnvFile(e.target.files?.[0] ?? null)}
              className="block w-full rounded-lg border border-app-border px-3 py-2 text-sm"
            />
            {envFile ? <p className="text-xs text-slate-500">Selected: {envFile.name}</p> : null}
          </label>
        </div>
      </details>

      {initial.id ? (
        <div className="flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              name="remove_requirement_doc"
              checked={form.remove_requirement_doc}
              onChange={(e) => patchForm('remove_requirement_doc', e.target.checked)}
            />
            Remove current requirement document
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              name="remove_env_file"
              checked={form.remove_env_file}
              onChange={(e) => patchForm('remove_env_file', e.target.checked)}
            />
            Remove current env file
          </label>
        </div>
      ) : null}
      <div className="text-xs text-slate-500">
        {initial.requirement_doc_url ? (
          <p>
            Requirement doc: <a href={initial.requirement_doc_url} target="_blank" rel="noreferrer" className="text-brand hover:underline">View file</a>
          </p>
        ) : null}
        {initial.env_file_url ? (
          <p>
            Env file: <a href={initial.env_file_url} target="_blank" rel="noreferrer" className="text-brand hover:underline">View file</a>
          </p>
        ) : null}
      </div>
      <label htmlFor="credential-notes" className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Notes</span>
        <textarea
          id="credential-notes"
          name="notes"
          rows={3}
          value={form.notes}
          onChange={(e) => patchForm('notes', e.target.value)}
          className="w-full rounded-lg border border-app-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
        />
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <span className="inline-flex items-center gap-2">
            {isSubmitting ? <Spinner size="sm" /> : null}
            Save
          </span>
        </Button>
      </div>
    </form>
  )
}

export default CredentialForm
