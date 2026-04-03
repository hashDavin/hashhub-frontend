import { useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import ModalShell from '@/components/modals/ModalShell'
import TextInput from '@/components/forms/TextInput'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import SvgIcon from '@/components/ui/SvgIcon'
import { createEmployeeSchema, editEmployeeSchema } from '@/validations/userSchemas'

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
  const {
    register,
    reset,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(mode === 'create' ? createEmployeeSchema : editEmployeeSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      remove_avatar: false,
    },
  })
  const avatarField = register('avatar')

  useEffect(() => {
    if (!open) {
      setShowPassword(false)
      setAvatarFileName('')
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
      setAvatarPreview('')
    }
  }, [open, avatarPreview])

  useEffect(() => {
    if (!open) return
    reset({
      name: employee?.name || '',
      email: employee?.email || '',
      password: '',
      remove_avatar: false,
    })
  }, [open, employee, reset])

  const title = mode === 'create' ? 'Add Team Member' : 'Edit Team Member'
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*'
    const length = 12
    const randomPassword = Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('')
    setValue('password', randomPassword, { shouldValidate: true, shouldDirty: true })
    setShowPassword(true)
  }

  return (
    <ModalShell open={open} onClose={() => (saving ? null : onClose())} title={title} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <TextInput
          id={`${mode}-name`}
          label="Name"
          placeholder="Enter full name"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <TextInput
          id={`${mode}-email`}
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <label htmlFor={`${mode}-password`} className="block space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-700">
              {mode === 'create' ? 'Password' : 'New password (optional)'}
            </span>
            <button
              type="button"
              onClick={generatePassword}
              className="text-xs font-medium text-brand hover:underline"
            >
              Generate password
            </button>
          </div>
          <div className="relative">
            <input
              id={`${mode}-password`}
              type={showPassword ? 'text' : 'password'}
              className={`h-10 w-full rounded-lg border px-3 pr-10 text-sm ${
                errors.password
                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'border-app-border focus:border-brand focus:ring-2 focus:ring-brand-soft'
              }`}
              {...register('password')}
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
          {errors.password ? <span className="text-xs text-red-600">{errors.password.message}</span> : null}
        </label>
        <label htmlFor={`${mode}-avatar`} className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">
            {mode === 'create' ? 'Profile Picture (optional)' : 'Replace photo (optional)'}
          </span>
          <input
            id={`${mode}-avatar`}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            name={avatarField.name}
            ref={avatarField.ref}
            onBlur={avatarField.onBlur}
            onChange={(e) => {
              avatarField.onChange(e)
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
        {/* {error ? <p className="text-sm text-red-600">{error}</p> : null} */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || isSubmitting}>
            <span className="inline-flex items-center gap-2">
              {saving || isSubmitting ? <Spinner size="sm" /> : null}
              {mode === 'create' ? 'Create Team Member' : 'Save Changes'}
            </span>
          </Button>
        </div>
      </form>
    </ModalShell>
  )
}

export default EmployeeFormModal
