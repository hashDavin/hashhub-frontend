import { X } from 'lucide-react'

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

function ModalShell({ open, title, children, onClose, wide, size = 'md', showCloseButton = true }) {
  if (!open) return null
  const resolvedSize = wide ? 'lg' : size

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 !mt-0">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40"
      />
      <div
        className={`relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-xl border border-app-border bg-white p-6 shadow-elevated ${
          sizeClasses[resolvedSize] || sizeClasses.md
        }`}
      >
        {title ? (
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {showCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ) : null}
        <div className={title ? 'mt-4' : ''}>{children}</div>
      </div>
    </div>
  )
}

export default ModalShell
