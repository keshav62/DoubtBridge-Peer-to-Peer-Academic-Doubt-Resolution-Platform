/**
 * Card — reusable white container
 *
 * Props:
 *   children    {ReactNode}
 *   className   {string}    — additional Tailwind classes
 *   padding     {'none'|'sm'|'md'|'lg'}  default 'md'
 *   shadow      {boolean}   default false
 *   hover       {boolean}   — adds a subtle hover lift effect
 */

const PADDING_CLASSES = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6 md:p-8',
};

export default function Card({
  children,
  className = '',
  padding = 'md',
  shadow = false,
  hover = false,
}) {
  return (
    <div
      className={[
        'rounded-2xl border border-[#E5EAF2] bg-white',
        PADDING_CLASSES[padding] ?? PADDING_CLASSES.md,
        shadow ? 'shadow-sm shadow-slate-200/60' : '',
        hover ? 'transition-all duration-150 hover:border-[#BFDBFE] hover:shadow-md hover:shadow-blue-100/50' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
