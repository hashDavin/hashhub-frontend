function ModalShell({ open, title, children, onClose, wide }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40"
      />
      <div
        className={`relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-xl border border-app-border bg-white p-6 shadow-elevated ${
          wide ? 'max-w-2xl' : 'max-w-md'
        }`}
      >
        {title ? <h3 className="text-lg font-semibold text-slate-900">{title}</h3> : null}
        <div className={title ? 'mt-4' : ''}>{children}</div>
      </div>
    </div>
  )
}

export default ModalShell
