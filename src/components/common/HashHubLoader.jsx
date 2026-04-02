import { cn } from '@/utils/cn';
import hashhubLogo from '@/assets/images/hashhub_logo.png';

function HashHubLoader({
  label = 'Loading...',
  size = 'md',
  inline = false,
  className,
  textClassName,
}) {
  const badgeSize = size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-xs'
  const ringSize = size === 'sm' ? 'h-9 w-9 border-2' : 'h-11 w-11 border-2'
  const gap = size === 'sm' ? 'gap-2' : 'gap-3'

  if (inline) {
    return (
      <span className={cn('inline-flex items-center', className)} role="status" aria-label={label}>
        <span className={cn('inline-block animate-spin rounded-full border-current border-t-transparent text-current', size === 'sm' ? 'h-4 w-4 border-2' : 'h-5 w-5 border-2')} />
      </span>
    )
  }

  return (
    <div className={cn('inline-flex flex-col items-center', gap, className)} role="status" aria-label={label}>
      <img src={hashhubLogo} alt="HashHub" className="h-10 w-auto" />
      {label ? <span className={cn('text-sm text-slate-500', textClassName)}>{label}</span> : null}
    </div>
  )
}

export default HashHubLoader
