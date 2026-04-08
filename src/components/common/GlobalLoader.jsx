import { useSelector } from 'react-redux'
import Spinner from '@/components/ui/Spinner'
import { selectGlobalLoaderPending } from '@/store/globalLoaderSlice'

function GlobalLoader() {
  const pending = useSelector(selectGlobalLoaderPending)

  if (pending === 0) {
    return null
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[9998] rounded-full border border-app-border bg-white/95 p-2 shadow-sm">
      <Spinner size="sm" />
    </div>
  )
}

export default GlobalLoader
