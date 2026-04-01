import HashHubLoader from '@/components/common/HashHubLoader'

function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
      <HashHubLoader label={label} />
    </div>
  )
}

export default PageLoader
