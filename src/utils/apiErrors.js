/** Apply Laravel { errors: { field: ['msg'] } } to react-hook-form setError. */
export function applyLaravelFieldErrors(setError, errors, fieldNames = ['email', 'password']) {
  if (!errors || typeof errors !== 'object') return
  fieldNames.forEach((name) => {
    const val = errors[name]
    if (val == null) return
    const message = Array.isArray(val) ? val[0] : val
    if (message) setError(name, { type: 'server', message: String(message) })
  })
}

/** Backend often returns only `email` for bad password; mirror so both fields show the error. */
export function mirrorAuthCredentialErrors(setError, errors) {
  if (!errors?.email || errors.password) return
  const msg = Array.isArray(errors.email) ? errors.email[0] : errors.email
  if (!msg) return
  const s = String(msg).toLowerCase()
  if (s.includes('credential') || s.includes('invalid')) {
    setError('password', { type: 'server', message: String(msg) })
  }
}
