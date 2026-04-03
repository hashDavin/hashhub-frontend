/** Extract user-facing message from axios/API errors (Laravel validation, etc.). */
export function getErrorMessage(error, fallback = 'Something went wrong.') {
  const data = error?.response?.data ?? error?.data
  const msg = data?.message
  if (typeof msg === 'string' && msg.trim()) return msg
  if (msg && typeof msg === 'object') {
    const first = Object.values(msg).flat()[0]
    if (first != null && String(first).trim()) return String(first)
  }
  if (typeof error?.message === 'string' && error.message.trim()) return error.message
  return fallback
}
