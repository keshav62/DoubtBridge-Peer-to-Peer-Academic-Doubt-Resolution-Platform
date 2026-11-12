'use client';

import { CheckCircle2, Clock, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  APPROVED: {
    label: 'Verified Answer',
    className: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    icon: CheckCircle2,
  },
  PENDING: {
    label: 'Pending Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  REJECTED: {
    label: 'Needs Revision',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
  },
};

export default function AnswerStatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.className} ${className}`}
    >
      <Icon size={12} className="shrink-0" />
      {config.label}
    </span>
  );
}

