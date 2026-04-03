import { cn } from '@/utils/cn'

const sizes = {
  sm: 'h-8 w-8 border-2',
  md: 'h-12 w-12 border-[3px]',
  lg: 'h-14 w-14 border-[3px]',
}

const tones = {
  default: 'border-slate-200/90 border-t-slate-900',
  onDark: 'border-white/35 border-t-white',
}

/**
 * Thin ring with a dark (or light-on-dark) arc that rotates.
 */
function RingSpinner({ size = 'md', tone = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full [animation-duration:0.85s]',
        tones[tone] ?? tones.default,
        sizes[size],
        className
      )}
      role="status"
      aria-label="Busy"
    />
  )
}

export default RingSpinner
