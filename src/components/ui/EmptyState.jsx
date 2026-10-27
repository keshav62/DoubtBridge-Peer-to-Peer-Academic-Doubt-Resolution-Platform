import { FileQuestion } from 'lucide-react';

/**
 * EmptyState — shown when a list has no results
 *
 * Props:
 *   icon        {ReactNode}   — Lucide icon element (defaults to FileQuestion)
 *   title       {string}      — short heading
 *   description {string}      — supportive text
 *   action      {ReactNode=}  — optional CTA (e.g. a <Button>)
 *   className   {string}      — extra classes on the wrapper
 */
export default function EmptyState({
  icon,
  title = 'Nothing here yet',
  description = 'There are no results to display at the moment.',
  action,
  className = '',
}) {
  const Icon = icon ?? <FileQuestion size={40} aria-hidden="true" />;

  return (
    <div
      className={[
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1]',
        'bg-white/[0.02] px-6 py-16 text-center',
        className,
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
        {icon ?? <FileQuestion size={30} aria-hidden="true" />}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-base font-semibold text-gray-100">{title}</h3>

      {/* Description */}
      <p className="max-w-sm text-sm leading-relaxed text-gray-500">{description}</p>

      {/* Optional action */}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
