import LoaderBackdrop from '@/components/common/LoaderBackdrop'

/** Auth hydrate & route Suspense — under global API loader z-index. */
function PageLoader() {
  return <LoaderBackdrop zClass="z-[9997]" spinnerSize="md" />
}

export default PageLoader
