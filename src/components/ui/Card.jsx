/**
 * Card — reusable container
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
        'rounded-xl border border-white/[0.08] bg-[#111827]/70 backdrop-blur-sm',
        PADDING_CLASSES[padding] ?? PADDING_CLASSES.md,
        shadow ? 'shadow-lg shadow-black/30' : '',
        hover ? 'transition-colors duration-150 hover:border-white/[0.14] hover:bg-[#1a2233]/70' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
