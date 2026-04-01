import { useEffect, useState } from 'react'
import ModalShell from '@/components/modals/ModalShell'
import Button from '@/components/ui/Button'
import SvgIcon from '@/components/ui/SvgIcon'

function EmployeeFormModal({
  open,
  mode = 'create',
  employee,
  saving,
  error,
  onClose,
  onSubmit,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [avatarFileName, setAvatarFileName] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')

  useEffect(() => {
    if (!open) {
      setShowPassword(false)
      setAvatarFileName('')
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
      setAvatarPreview('')
    }
  }, [open, avatarPreview])

  const title = mode === 'create' ? 'Add Employee' : 'Edit Employee'

  return (
    <ModalShell open={open} onClose={() => (saving ? null : onClose())} title={title}>
      <form onSubmit={onSubmit} className="space-y-4">
        <label htmlFor={`${mode}-name`} className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input
            id={`${mode}-name`}
            name="name"
            defaultValue={employee?.name || ''}
            className="h-10 w-full rounded-lg border border-app-border px-3 text-sm"
          />
        </label>
        <label htmlFor={`${mode}-email`} className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            id={`${mode}-email`}
            name="email"
            type="email"
            defaultValue={employee?.email || ''}
            className="h-10 w-full rounded-lg border border-app-border px-3 text-sm"
          />
        </label>
        <label htmlFor={`${mode}-password`} className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">
            {mode === 'create' ? 'Temporary Password' : 'New password (optional)'}
          </span>
          <div className="relative">
            <input
              id={`${mode}-password`}
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="h-10 w-full rounded-lg border border-app-border px-3 pr-10 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-slate-500 hover:text-slate-800"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <SvgIcon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
            </button>
          </div>
        </label>
        <label htmlFor={`${mode}-avatar`} className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">
            {mode === 'create' ? 'Profile image (optional)' : 'Replace photo (optional)'}
          </span>
          <input
            id={`${mode}-avatar`}
            name="avatar"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              setAvatarFileName(file?.name || '')
              if (avatarPreview) URL.revokeObjectURL(avatarPreview)
              setAvatarPreview(file ? URL.createObjectURL(file) : '')
            }}
          />
          <div className="rounded-lg border border-app-border bg-white p-3">
            <div className="flex items-center gap-3">
              <label
                htmlFor={`${mode}-avatar`}
                className="cursor-pointer rounded-md border border-app-border px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Upload image
              </label>
              <span className="truncate text-sm text-slate-500">{avatarFileName || 'No file selected'}</span>
            </div>
            {avatarPreview ? (
              <div className="mt-3 flex items-center gap-3 rounded-md bg-slate-50 p-2">
                <img src={avatarPreview} alt="Selected avatar preview" className="h-12 w-12 rounded-full object-cover" />
                <span className="text-xs text-slate-500">Preview</span>
              </div>
            ) : null}
          </div>
        </label>
        {mode === 'edit' ? (
          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" name="remove_avatar" />
            Remove current photo
          </label>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (mode === 'create' ? 'Creating...' : 'Saving...') : mode === 'create' ? 'Create Employee' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </ModalShell>
  )
}

export default EmployeeFormModal
