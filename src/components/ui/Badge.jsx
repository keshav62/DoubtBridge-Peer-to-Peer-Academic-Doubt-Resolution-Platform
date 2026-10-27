/**
 * Badge — status indicator used across Doubts, Knowledge, and Moderation modules.
 *
 * Supported statuses (case-insensitive):
 *   OPEN | MATCHED | PENDING_REVIEW | APPROVED | REJECTED | RESOLVED
 *   claimed (legacy alias for MATCHED)
 *
 * Props:
 *   status    {string}   — one of the statuses above
 *   label     {string=}  — override the display label
 *   dot       {boolean}  — show a small colored dot (default true)
 *   className {string}   — extra Tailwind classes
 */

const STATUS_MAP = {
  OPEN: {
    label: 'Open',
    classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  MATCHED: {
    label: 'Matched',
    classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400',
  },
  CLAIMED: {
    label: 'Claimed',
    classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400',
  },
  PENDING_REVIEW: {
    label: 'Pending Review',
    classes: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    dot: 'bg-sky-400',
  },
  APPROVED: {
    label: 'Approved',
    classes: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    dot: 'bg-indigo-400',
  },
  REJECTED: {
    label: 'Rejected',
    classes: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    dot: 'bg-rose-400',
  },
  RESOLVED: {
    label: 'Resolved',
    classes: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    dot: 'bg-violet-400',
  },
};

/** Fallback for unknown statuses */
const FALLBACK = {
  label: 'Unknown',
  classes: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  dot: 'bg-gray-400',
};

export default function Badge({ status = '', label, dot = true, className = '' }) {
  const key = status.toUpperCase().replace(/-/g, '_');
  const config = STATUS_MAP[key] ?? FALLBACK;
  const displayLabel = label ?? config.label;

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.classes,
        className,
      ].join(' ')}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={`inline-block h-1.5 w-1.5 rounded-full ${config.dot}`}
        />
      )}
      {displayLabel}
    </span>
  );
}
