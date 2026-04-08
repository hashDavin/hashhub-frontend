import HashHubLoader from '@/components/common/HashHubLoader'

/** Lightweight route fallback; avoids full-screen blocking overlay. */
function PageLoader() {
  return (
    <div className="flex min-h-[220px] items-center justify-center">
      <HashHubLoader size="sm" />
    </div>
  )
}

export default PageLoader
