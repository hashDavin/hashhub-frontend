import { memo } from 'react'
import { cn } from '@/utils/cn'
import HashHubLoader from '@/components/common/HashHubLoader'

function cellAlign(col) {
  return col.align === 'right' ? 'text-right' : ''
}

const DataTableBody = memo(function DataTableBody({ columns, rows, isLoading, emptyMessage }) {
  if (isLoading) {
    return (
      <tr>
        <td colSpan={columns.length} className="px-4 py-12 text-center">
          <div className="inline-flex flex-col items-center gap-2 text-slate-500">
            <HashHubLoader />
          </div>
        </td>
      </tr>
    )
  }
  if (rows.length === 0) {
    return (
      <tr>
        <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-slate-500">
          {emptyMessage}
        </td>
      </tr>
    )
  }
  return rows.map((row, idx) => (
    <tr key={row.id ?? idx} className="border-b border-app-border last:border-0">
      {columns.map((col) => (
        <td key={col.key} className={cn('px-4 py-3 text-slate-700', col.className, cellAlign(col))}>
          {col.render ? col.render(row) : row[col.accessor]}
        </td>
      ))}
    </tr>
  ))
})

function DataTable({
  title,
  columns = [],
  rows = [],
  isLoading = false,
  searchPlaceholder = 'Search…',
  searchValue = '',
  onSearchChange,
  emptyMessage = 'No data found.',
  pagination,
  children,
}) {
  const { page, lastPage, total, onPageChange } = pagination || {}

  return (
    <div className="rounded-xl border border-app-border bg-app-card shadow-card">
      {(title || onSearchChange) && (
        <div className="flex flex-col gap-3 border-b border-app-border p-4 sm:flex-row sm:items-center sm:justify-between">
          {title ? <h3 className="text-base font-semibold text-slate-900">{title}</h3> : <span />}
          {onSearchChange ? (
            <input
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full max-w-xs rounded-lg border border-app-border px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft sm:w-64"
            />
          ) : null}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-app-border bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {columns.map((col) => (
                <th key={col.key} className={cn('px-4 py-3', col.className, cellAlign(col))}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <DataTableBody
              columns={columns}
              rows={rows}
              isLoading={isLoading}
              emptyMessage={emptyMessage}
            />
          </tbody>
        </table>
      </div>
      {children}
      {lastPage > 1 && onPageChange ? (
        <div className="flex items-center justify-between border-t border-app-border px-4 py-3 text-sm text-slate-600">
          <span>
            Page {page} of {lastPage}
            {total != null ? ` · ${total} total` : ''}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="rounded-lg border border-app-border px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= lastPage}
              onClick={() => onPageChange(page + 1)}
              className="rounded-lg border border-app-border px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default memo(DataTable)
