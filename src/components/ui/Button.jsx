import { cn } from '@/utils/cn'
import SvgIcon from '@/components/ui/SvgIcon'

const variants = {
  primary:
    'bg-[#3BC2DB] text-white hover:bg-white hover:text-[#3BC2DB] hover:border-[#3BC2DB] hover:border focus:ring-brand-soft disabled:pointer-events-none disabled:opacity-50',
  secondary:
    'border border-app-border bg-white text-slate-700 hover:bg-slate-50 focus:ring-brand-soft disabled:pointer-events-none disabled:opacity-50',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200 disabled:pointer-events-none disabled:opacity-50',
  ghost:
    'border border-transparent bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-brand-soft disabled:pointer-events-none disabled:opacity-50',
  dangerGhost:
    'border border-transparent bg-transparent text-red-600 hover:bg-red-50 focus:ring-red-200 disabled:pointer-events-none disabled:opacity-50',
}

const sizes = {
  md: 'h-10 px-4 text-sm',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-12 px-5 text-base',
  icon: 'h-9 w-9 p-0 inline-flex items-center justify-center',
}

function Button({
  type = 'button',
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  iconSize = 16,
  className,
  children,
  onClick,
  disabled,
  title: titleAttr,
  'aria-label': ariaLabel,
}) {
  const buttonType = type === 'submit' ? 'submit' : 'button'

  return (
    <button
      type={buttonType}
      onClick={onClick}
      disabled={disabled}
      title={titleAttr}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus:outline-none focus:ring-2',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {icon && iconPosition === 'left' ? <SvgIcon name={icon} size={iconSize} /> : null}
      {children}
      {icon && iconPosition === 'right' ? <SvgIcon name={icon} size={iconSize} /> : null}
    </button>
  )
}

export default Button
