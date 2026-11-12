'use client';

import Link from 'next/link';
import { ArrowRight, MessageSquare, User } from 'lucide-react';
import DoubtStatusBadge from './DoubtStatusBadge';
import { timeAgo } from '@/lib/utils';

/**
 * Urgency label styling map.
 */
const URGENCY_STYLES = {
  HIGH: 'text-red-600',
  MEDIUM: 'text-amber-600',
  LOW: 'text-[#64748B]',
};

/**
 * DoubtCard — renders a single doubt item in the listing.
 *
 * Props:
 *   doubt {object} — a doubt record returned by the API, including:
 *     id, title, description, subject, topic, status, urgency,
 *     createdAt, student { name, avatar }, helper { name },
 *     _count { answers }
 */
export default function DoubtCard({ doubt }) {
  const answersCount = doubt._count?.answers ?? 0;

  return (
    <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 transition-all hover:border-[#BFDBFE] hover:shadow-sm group">
      <div className="flex items-start justify-between gap-4">
        {/* Left content */}
        <div className="min-w-0 flex-1">
          {/* Tags row */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <DoubtStatusBadge status={doubt.status} />
            <span className="inline-flex items-center rounded-full bg-[#EFF6FF] text-[#2563EB] px-2.5 py-0.5 text-xs font-semibold">
              {doubt.subject}
            </span>
            {doubt.topic && (
              <span className="inline-flex items-center rounded-full bg-slate-50 text-[#344568] px-2.5 py-0.5 text-xs font-medium">
                {doubt.topic}
              </span>
            )}
            <span
              className={`text-xs font-medium ${URGENCY_STYLES[doubt.urgency] ?? 'text-[#64748B]'}`}
            >
              {doubt.urgency} urgency
            </span>
          </div>

          {/* Title */}
          <h2 className="text-base font-semibold text-[#101B3D] leading-snug mb-1">
            <Link
              href={`/doubts/${doubt.id}`}
              className="hover:text-[#2563EB] transition-colors"
            >
              {doubt.title}
            </Link>
          </h2>

          {/* Description preview */}
          {doubt.description && (
            <p className="text-sm text-[#64748B] leading-relaxed mb-2 line-clamp-2">
              {doubt.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 flex-wrap text-xs text-[#64748B]">
            <span className="inline-flex items-center gap-1">
              <User size={12} />
              {doubt.student?.name ?? 'Unknown'}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare size={12} />
              {answersCount} {answersCount === 1 ? 'answer' : 'answers'}
            </span>
            <span>{timeAgo(doubt.createdAt)}</span>
            {doubt.helper && (
              <span className="text-[#2563EB] font-medium">
                Helper: {doubt.helper.name}
              </span>
            )}
          </div>
        </div>

        {/* Right action */}
        <Link
          href={`/doubts/${doubt.id}`}
          className="flex-shrink-0 hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2 text-xs font-semibold text-[#344568] hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-all whitespace-nowrap"
        >
          View Details
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

