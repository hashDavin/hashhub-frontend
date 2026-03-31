import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'

function ConfirmationModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
  loading = false,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={loading ? undefined : onCancel}
        disabled={loading}
        className="absolute inset-0 bg-slate-900/40"
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-md rounded-xl border bg-white p-6 shadow-elevated',
          danger ? 'border-red-200' : 'border-app-border'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <h3 id="confirm-modal-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h3>
        {message ? <p className="mt-2 text-sm text-slate-600">{message}</p> : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            <span className="inline-flex items-center justify-center gap-2">
              {loading ? <Spinner size="sm" className="text-white" /> : null}
              {loading ? `${confirmLabel}…` : confirmLabel}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
