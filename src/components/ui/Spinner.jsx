import { cn } from '@/utils/cn'

function Spinner({ className, size = 'md' }) {
  const sizeCls = size === 'sm' ? 'h-4 w-4 border-2' : 'h-5 w-5 border-2'
  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-current border-t-transparent text-current',
        sizeCls,
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}

export default Spinner
