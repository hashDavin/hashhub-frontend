import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { cn } from '@/utils/cn'

const ToastContext = createContext(null)

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (message, variant) => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, message, variant }])
      window.setTimeout(() => dismiss(id), 4500)
    },
    [dismiss]
  )

  const success = useCallback((message) => push(message, 'success'), [push])
  const error = useCallback((message) => push(message, 'error'), [push])

  const value = useMemo(() => ({ success, error }), [success, error])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[10050] flex max-w-sm flex-col gap-2 p-0 sm:max-w-md"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto rounded-lg border px-4 py-3 text-sm font-medium shadow-lg',
              t.variant === 'error'
                ? 'border-red-200 bg-red-50 text-red-900'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900'
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}

export { ToastProvider, useToast }
