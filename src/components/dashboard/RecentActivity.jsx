'use client';

import Link from 'next/link';
import {
  Activity,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { timeAgo } from '@/lib/utils';

const TYPE_ICONS = {
  DOUBT_CREATED: HelpCircle,
  ANSWER_SUBMITTED: MessageSquare,
  MODERATION_REVIEW: ShieldCheck,
  DOUBT_CLAIMED: UserCheck,
  DOUBT_RESOLVED: CheckCircle2,
};

export default function RecentActivity({ activities = [] }) {
  return (
    <div className="rounded-2xl border border-[#E5EAF2] bg-white overflow-hidden shadow-xs">
      <div className="px-6 py-4 border-b border-[#E5EAF2] flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#101B3D] flex items-center gap-2">
            <Activity size={17} className="text-[#2563EB]" />
            Recent Activity
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Live chronological events across the platform
          </p>
        </div>
      </div>

      {activities.length > 0 ? (
        <div className="divide-y divide-[#F1F5F9] p-2">
          {activities.map((act) => {
            const Icon = TYPE_ICONS[act.type] || Activity;
            return (
              <div
                key={act.id}
                className="flex items-start gap-3 p-3.5 hover:bg-[#F8FAFC] rounded-xl transition-colors group"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                    act.badgeColor || 'text-[#2563EB] bg-[#EFF6FF] border-blue-200'
                  }`}
                >
                  <Icon size={15} />
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <p className="text-[#101B3D] leading-snug">
                    <span className="font-semibold text-[#101B3D]">{act.actor}</span>{' '}
                    <span className="text-[#475569]">{act.message}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[#94A3B8]">
                    <span>{timeAgo(act.timestamp)}</span>
                    {act.link && (
                      <>
                        <span>·</span>
                        <Link
                          href={act.link}
                          className="font-medium text-[#2563EB] hover:underline inline-flex items-center gap-0.5"
                        >
                          View Details <ArrowRight size={10} />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-[#64748B]">
          No recent activity logged yet.
        </div>
      )}
    </div>
  );
}

