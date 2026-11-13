'use client';

import { ShieldCheck, ShieldAlert } from 'lucide-react';

export default function AdminAccountStatusBadge({ isActive, suspensionReason, className = '' }) {
  if (isActive) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/80 ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Active
      </span>
    );
  }

  return (
    <span
      title={suspensionReason || 'Account suspended by administrator'}
      className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200/80 ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Suspended
    </span>
  );
}
