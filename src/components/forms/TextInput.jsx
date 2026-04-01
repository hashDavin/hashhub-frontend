function TextInput({
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
}) {
  return (
    <label htmlFor={id} className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        id={id}
        name={name ?? id}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        disabled={disabled}
        className="h-10 w-full rounded-lg border border-app-border px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-soft"
      />
    </label>
  )
}

export default TextInput
