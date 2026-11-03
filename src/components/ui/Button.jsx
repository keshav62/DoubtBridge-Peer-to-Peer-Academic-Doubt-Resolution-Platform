import { Loader2 } from 'lucide-react';

/**
 * Button — reusable action element
 *
 * Props:
 *   variant   {'primary'|'secondary'|'outline'|'ghost'|'danger'}  default 'primary'
 *   size      {'sm'|'md'|'lg'}                                    default 'md'
 *   icon      {ReactNode}   — icon rendered before children
 *   iconRight {ReactNode}   — icon rendered after children
 *   loading   {boolean}     — shows spinner and disables the button
 *   disabled  {boolean}
 *   children  {ReactNode}
 *   ...rest   — forwarded to <button>
 */

const VARIANT_CLASSES = {
  primary:
    'bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF] border-transparent shadow-sm shadow-blue-500/25',
  secondary:
    'bg-white text-[#101B3D] hover:bg-[#F8FAFC] active:bg-[#F1F5F9] border-[#E5EAF2]',
  outline:
    'bg-transparent text-[#2563EB] hover:bg-[#EFF6FF] active:bg-[#DBEAFE] border-[#2563EB]/40',
  ghost:
    'bg-transparent text-[#344568] hover:bg-[#F8FAFC] active:bg-[#F1F5F9] border-transparent',
  danger:
    'bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 border-red-200',
};

const SIZE_CLASSES = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-9 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-11 px-6 text-base gap-2.5 rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  children,
  className = '',
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        // Base
        'inline-flex items-center justify-center font-semibold border transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        // Disabled
        isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        // Variant
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary,
        // Size
        SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
      ) : (
        icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
      )}

      {children && <span>{children}</span>}

      {!loading && iconRight && (
        <span className="flex-shrink-0" aria-hidden="true">{iconRight}</span>
      )}
    </button>
  );
}
