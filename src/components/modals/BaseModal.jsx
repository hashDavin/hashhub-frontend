function BaseModal({ title, children }) {
  return (
    <div className="rounded-xl border border-app-border bg-app-card p-6 shadow-elevated">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export default BaseModal
