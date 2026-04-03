import { useSelector } from 'react-redux'
import LoaderBackdrop from '@/components/common/LoaderBackdrop'
import { selectGlobalLoaderPending } from '@/store/globalLoaderSlice'

function GlobalLoader() {
  const pending = useSelector(selectGlobalLoaderPending)

  if (pending === 0) {
    return null
  }

  return <LoaderBackdrop zClass="z-[9998]" spinnerSize="md"  />
}

export default GlobalLoader
