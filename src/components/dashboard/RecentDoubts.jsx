'use client';

import Link from 'next/link';
import { ArrowRight, HelpCircle, MessageSquare, User, Clock } from 'lucide-react';
import DoubtStatusBadge from '@/components/doubts/DoubtStatusBadge';
import { timeAgo } from '@/lib/utils';

export default function RecentDoubts({
  doubts = [],
  role = 'STUDENT',
  title = 'Recent Doubts',
}) {
  return (
    <div className="rounded-2xl border border-[#E5EAF2] bg-white overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EAF2]">
        <div>
          <h2 className="text-base font-bold text-[#101B3D]">{title}</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            {role === 'STUDENT'
              ? 'Your latest posted questions & updates'
              : 'Latest academic doubts posted by university peers'}
          </p>
        </div>
        <Link
          href="/doubts"
          className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors whitespace-nowrap"
        >
          View all <ArrowRight size={13} />
        </Link>
      </div>

      {/* Doubts list */}
      {doubts.length > 0 ? (
        <div className="divide-y divide-[#F1F5F9]">
          {doubts.map((doubt) => {
            const answersCount = doubt._count?.answers ?? 0;
            return (
              <div
                key={doubt.id}
                className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-[#F8FAFC] transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  {/* Tags row */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <DoubtStatusBadge status={doubt.status} />
                    <span className="text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full">
                      {doubt.subject}
                    </span>
                    {doubt.topic && (
                      <span className="text-xs font-medium text-[#475569] bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {doubt.topic}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-[#101B3D] leading-snug truncate group-hover:text-[#2563EB] transition-colors">
                    <Link href={`/doubts/${doubt.id}`}>{doubt.title}</Link>
                  </h3>

                  {/* Metadata */}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-[#64748B]">
                    <span className="inline-flex items-center gap-1">
                      <User size={12} />
                      {doubt.student?.name || 'Student'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare size={12} />
                      {answersCount} {answersCount === 1 ? 'answer' : 'answers'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} />
                      {timeAgo(doubt.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <Link
                  href={`/doubts/${doubt.id}`}
                  className="flex-shrink-0 hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAF2] bg-white px-3 py-1.5 text-xs font-semibold text-[#344568] hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-all whitespace-nowrap"
                >
                  View
                  <ArrowRight size={12} />
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-14 text-center px-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
            <HelpCircle size={24} />
          </div>
          <p className="text-sm font-semibold text-[#101B3D]">No doubts found</p>
          <p className="text-xs text-[#64748B] mt-1">
            Post your first academic doubt to connect with peer helpers.
          </p>
          <Link
            href="/doubts/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
          >
            Ask a Doubt
          </Link>
        </div>
      )}
    </div>
  );
}

