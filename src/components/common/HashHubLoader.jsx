import { cn } from '@/utils/cn'
import RingSpinner from '@/components/ui/RingSpinner'

function HashHubLoader({ label = '', size = 'md', inline = false, lightOnDark = false, className, textClassName }) {
  const gap = size === 'sm' ? 'gap-2' : 'gap-3'
  const aria = label || 'Busy'
  const spinnerSize = size === 'sm' ? 'sm' : 'md'
  const tone = lightOnDark ? 'onDark' : 'default'

  if (inline) {
    return <RingSpinner size={spinnerSize} tone={tone} className={className} />
  }

  return (
    <div
      className={cn('inline-flex flex-col items-center', gap, className)}
      role="status"
      aria-label={aria}
    >
      <RingSpinner size={spinnerSize} tone="default" />
      {label ? <span className={cn('text-sm text-slate-500', textClassName)}>{label}</span> : null}
    </div>
  )
}

export default HashHubLoader
