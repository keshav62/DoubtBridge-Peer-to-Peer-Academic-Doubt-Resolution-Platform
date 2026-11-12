'use client';

import Badge from '@/components/ui/Badge';

/**
 * DoubtStatusBadge — thin wrapper over the generic Badge component
 * that normalises doubt status values for display.
 *
 * Props:
 *   status    {string}  — one of the DoubtStatus enum values
 *   className {string}  — extra Tailwind classes
 */
export default function DoubtStatusBadge({ status, className = '' }) {
  return <Badge status={status} className={className} />;
}

