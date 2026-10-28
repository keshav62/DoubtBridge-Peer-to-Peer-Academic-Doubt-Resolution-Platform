/**
 * Badge — status indicator used across Doubts, Knowledge, and Moderation modules.
 *
 * Supported statuses (case-insensitive):
 *   OPEN | MATCHED | CLAIMED | IN_PROGRESS | PENDING_REVIEW | APPROVED | REJECTED | RESOLVED
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
    classes: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    dot: 'bg-[#10B981]',
  },
  MATCHED: {
    label: 'Matched',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  CLAIMED: {
    label: 'Claimed',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    classes: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
    dot: 'bg-[#2563EB]',
  },
  PENDING_REVIEW: {
    label: 'Pending Review',
    classes: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
  },
  APPROVED: {
    label: 'Approved',
    classes: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    dot: 'bg-[#10B981]',
  },
  REJECTED: {
    label: 'Rejected',
    classes: 'bg-red-50 text-red-600 border-red-200',
    dot: 'bg-red-500',
  },
  RESOLVED: {
    label: 'Resolved',
    classes: 'bg-[#EDE9FE] text-violet-700 border-violet-200',
    dot: 'bg-violet-500',
  },
  PENDING: {
    label: 'Pending',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
};

/** Fallback for unknown statuses */
const FALLBACK = {
  label: 'Unknown',
  classes: 'bg-slate-100 text-slate-600 border-slate-200',
  dot: 'bg-slate-400',
};

export default function Badge({ status = '', label, dot = true, className = '' }) {
  const key = status.toUpperCase().replace(/-/g, '_').replace(/ /g, '_');
  const config = STATUS_MAP[key] ?? FALLBACK;
  const displayLabel = label ?? config.label;

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
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
