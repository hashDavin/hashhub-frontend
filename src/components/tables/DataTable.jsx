import { memo } from 'react'
import { cn } from '@/utils/cn'
import HashHubLoader from '@/components/common/HashHubLoader'
import Button from '@/components/ui/Button'

function cellAlign(col) {
  if (col.align === 'right') return 'text-right'
  if (col.align === 'center') return 'text-center'
  return ''
}

function resolveRowKey(row, rowKey, index) {
  if (rowKey === undefined) return row?.id ?? `row-${index}`
  if (typeof rowKey === 'function') return rowKey(row, index)
  return row?.[rowKey] ?? `row-${index}`
}

const DataTableBody = memo(function DataTableBody({
  columns,
  rows,
  isLoading,
  emptyMessage,
  rowKey,
}) {
  if (isLoading) {
    return (
      <tr>
        <td colSpan={columns.length} className="px-4 py-14 text-center">
          <div className="inline-flex flex-col items-center gap-2 text-slate-500">
            <HashHubLoader size="sm" />
          </div>
        </td>
      </tr>
    )
  }
  if (rows.length === 0) {
    return (
      <tr>
        <td colSpan={columns.length} className="px-4 py-14 text-center text-sm text-slate-500">
          {emptyMessage}
        </td>
      </tr>
    )
  }
  return rows.map((row, idx) => (
    <tr
      key={resolveRowKey(row, rowKey, idx)}
      className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80"
    >
      {columns.map((col) => (
        <td
          key={col.key}
          className={cn(
            'px-4 py-3.5 align-middle text-sm text-slate-700',
            col.className,
            cellAlign(col)
          )}
        >
          {col.render ? col.render(row) : row[col.accessor]}
        </td>
      ))}
    </tr>
  ))
})

/**
 * Reusable listing table: header row + body rows + optional pagination footer.
 *
 * Pagination (two styles):
 * - `footerPagination`: { rangeLabel, canPrev, canNext, onPrev, onNext } — Prev/Next + range text (Team/Projects)
 * - `pagination`: { page, lastPage, total, onPageChange } — numbered pages (legacy)
 */
function DataTable({
  columns = [],
  rows = [],
  rowKey = 'id',
  isLoading = false,
  emptyMessage = 'No data found.',
  title,
  searchPlaceholder = 'Search…',
  searchValue = '',
  onSearchChange,
  footerPagination,
  pagination,
  children,
  className,
}) {
  const { page, lastPage, total, onPageChange } = pagination || {}
  const { rangeLabel, canPrev, canNext, onPrev, onNext } = footerPagination || {}

  const showLegacyPager = lastPage > 1 && onPageChange
  const showFooterPager = Boolean(
    footerPagination &&
      (rangeLabel || onPrev || onNext || canPrev !== undefined || canNext !== undefined)
  )

  return (
    <div
      className={cn(
        'relative overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm',
        className
      )}
    >
      {(title || onSearchChange) && (
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          {title ? <h3 className="text-base font-semibold text-slate-900">{title}</h3> : <span />}
          {onSearchChange ? (
            <input
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:w-64"
            />
          ) : null}
        </div>
      )}
      <div className="relative z-20 overflow-x-auto overflow-y-visible">
        <table className="w-full min-w-[720px] table-fixed text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-semibold text-slate-500">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn('px-4 py-3 font-semibold', col.thClassName, cellAlign(col))}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            <DataTableBody
              columns={columns}
              rows={rows}
              rowKey={rowKey}
              isLoading={isLoading}
              emptyMessage={emptyMessage}
            />
          </tbody>
        </table>
      </div>
      {children}
      {showFooterPager ? (
        <div className="relative z-10 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-4 py-3">
          {rangeLabel ? <span className="text-xs text-slate-500">{rangeLabel}</span> : null}
          <Button type="button" variant="secondary" size="sm" disabled={!canPrev} onClick={onPrev}>
            Prev
          </Button>
          <Button type="button" variant="secondary" size="sm" disabled={!canNext} onClick={onNext}>
            Next
          </Button>
        </div>
      ) : null}
      {showLegacyPager ? (
        <div className="relative z-10 flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
          <span>
            Page {page} of {lastPage}
            {total != null ? ` · ${total} total` : ''}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= lastPage}
              onClick={() => onPageChange(page + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
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
