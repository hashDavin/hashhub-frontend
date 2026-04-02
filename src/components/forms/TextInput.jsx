import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

const TextInput = forwardRef(function TextInput({
  id,
  name,
  label,
  placeholder,
  type = 'text',
  defaultValue,
  value,
  onChange,
  autoComplete,
  disabled,
  onBlur,
  error,
}, ref) {
  return (
    <label htmlFor={id} className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        ref={ref}
        id={id}
        name={name ?? id}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        disabled={disabled}
        className={cn(
          'h-10 w-full rounded-lg border px-3 text-sm outline-none transition',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-app-border focus:border-brand focus:ring-2 focus:ring-brand-soft'
        )}
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  )
})

export default TextInput
