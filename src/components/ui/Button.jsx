import { Loader2 } from 'lucide-react';

/**
 * Button — reusable action element
 *
 * Props:
 *   variant   {'primary'|'secondary'|'outline'|'danger'}  default 'primary'
 *   size      {'sm'|'md'|'lg'}                            default 'md'
 *   icon      {ReactNode}   — icon rendered before children
 *   iconRight {ReactNode}   — icon rendered after children
 *   loading   {boolean}     — shows spinner and disables the button
 *   disabled  {boolean}
 *   children  {ReactNode}
 *   ...rest   — forwarded to <button>
 */

const VARIANT_CLASSES = {
  primary:
    'bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700 border-transparent shadow-sm',
  secondary:
    'bg-white/[0.07] text-gray-200 hover:bg-white/[0.12] active:bg-white/[0.16] border-white/[0.1]',
  outline:
    'bg-transparent text-gray-200 hover:bg-white/[0.06] active:bg-white/[0.1] border-white/[0.2]',
  danger:
    'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 active:bg-rose-500/30 border-rose-500/30',
};

const SIZE_CLASSES = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
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
        'inline-flex items-center justify-center font-medium border transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]',
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

