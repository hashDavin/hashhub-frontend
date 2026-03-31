import Spinner from '@/components/ui/Spinner'

function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
      <Spinner />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export default PageLoader
