import Button from '@/components/ui/Button'
import HashHubLoader from '@/components/common/HashHubLoader'

function EntityListCard({
  headers,
  rows,
  children,
  isLoading,
  isEmpty,
  emptyText = 'No records found.',
  rangeLabel,
  canPrev,
  canNext,
  onPrev,
  onNext,
  className = '',
  headerGridClass = 'grid-cols-[2.4fr_1fr_1fr_1fr_44px]',
}) {
  return (
    <section className={`space-y-3 rounded-2xl border border-app-border bg-slate-100 p-4 shadow-card ${className}`}>
      {children ? <div>{children}</div> : null}

      <div className={`grid ${headerGridClass} gap-3 px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500`}>
        {headers.map((header) => (
          <p key={header}>{header}</p>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center gap-2 rounded-2xl bg-white">
            <HashHubLoader size="sm" />
          </div>
        ) : isEmpty ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl bg-white text-slate-500">
            {emptyText}
          </div>
        ) : (
          rows
        )}
      </div>
{rows.length > 10 && (
      <div className="flex items-center justify-end gap-2 pt-1">
        <span className="text-xs text-slate-500">{rangeLabel}</span>
        <Button type="button" variant="secondary" size="sm" disabled={!canPrev} onClick={onPrev}>
          Prev
        </Button>
        <Button type="button" variant="secondary" size="sm" disabled={!canNext} onClick={onNext}>
          Next
        </Button>
      </div>
      )}
    </section>
  )
}

export default EntityListCard
