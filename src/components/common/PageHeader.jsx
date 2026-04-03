import { useEffect, useRef, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/utils/cn'

function PageHeader({ title, description, action, search, filters, className }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const searchInputRef = useRef(null)

  const hasSearch = Boolean(search && typeof search.onChange === 'function')
  const hasFilters = Boolean(filters?.children)

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  const searchValue = hasSearch ? String(search.value ?? '') : ''
  const placeholder = search?.placeholder ?? 'Search...'

  const closeSearch = () => {
    setSearchOpen(false)
    if (hasSearch) search.onChange('')
  }

  return (
    <header className={cn('mb-8 space-y-4 border-b border-slate-100 pb-6', className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="min-w-0 shrink-0 lg:max-w-[min(100%,32rem)]">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2.5 sm:gap-3">
          {hasSearch && searchOpen ? (
            <div className="flex min-w-0 w-full flex-1 items-center gap-2 sm:w-auto sm:max-w-xl lg:max-w-2xl">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
                  strokeWidth={2}
                />
                <input
                  ref={searchInputRef}
                  type="search"
                  autoComplete="off"
                  value={searchValue}
                  onChange={(e) => search.onChange(e.target.value)}
                  placeholder={placeholder}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white py-2 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <button
                type="button"
                onClick={closeSearch}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand/40 bg-brand-soft text-brand transition hover:bg-brand-soft/80 hover:text-brand-hover"
                aria-label="Close search"
              >
                <X className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>
          ) : null}

          {hasSearch && !searchOpen ? (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-brand/50 bg-brand-soft/90 text-brand transition hover:border-brand hover:bg-brand-soft"
              aria-label="Open search"
              aria-expanded={false}
            >
              <Search className="h-5 w-5" strokeWidth={2} />
            </button>
          ) : null}

          {hasFilters ? (
            <button
              type="button"
              onClick={() => setFilterOpen((open) => !open)}
              className={cn(
                'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition',
                filterOpen
                  ? 'border-brand bg-white text-brand shadow-sm ring-2 ring-brand/25'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              )}
              aria-label={filterOpen ? 'Hide advanced filters' : 'Show advanced filters'}
              aria-expanded={filterOpen}
            >
              <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
            </button>
          ) : null}

          {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
        </div>
      </div>

      {hasFilters && filterOpen ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-slate-900">Filters</p>
          <div>{filters.children}</div>
          {filters.onClear ? (
            <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={filters.onClear}
                className="rounded-lg border-2 border-brand px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand-soft"
              >
                Clear filters ({filters.activeCount ?? 0})
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  )
}

export default PageHeader
