import { cn } from '@/utils/cn'
import RingSpinner from '@/components/ui/RingSpinner'

/**
 * Full-screen frosted overlay + centered ring spinner (reference: heavy blur, light tint).
 */
function LoaderBackdrop({ className, children, spinnerSize = 'md', zClass = 'z-[9998]' }) {
  return (
    <div
      className={cn(
        'fixed inset-0 flex items-center justify-center',
        zClass,
        'bg-white/45 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/35',
        className
      )}
      role="progressbar"
      aria-busy="true"
      aria-valuetext="Busy"
    >
      {children ?? <RingSpinner size={spinnerSize} />}
    </div>
  )
}

export default LoaderBackdrop
