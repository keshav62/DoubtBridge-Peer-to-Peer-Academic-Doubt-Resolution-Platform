'use client';

import {
  Users,
  HelpCircle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileQuestion,
  Clock,
  Flag,
} from 'lucide-react';

export default function AdminStats({ metrics, loading = false }) {
  if (loading || !metrics) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white border border-[#E5EAF2] p-5 animate-pulse flex flex-col justify-between">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-8 w-16 bg-slate-200 rounded" />
              <div className="h-3 w-32 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { users, content, pendingQueue, answers } = metrics;
  const approvedCount = answers?.approved ?? content?.approvedAnswers ?? 0;
  const rejectedCount = answers?.rejected ?? content?.rejectedAnswers ?? 0;
  const needsChangesCount = answers?.needsChanges ?? content?.needsChangesAnswers ?? 0;
  const pendingAnswersCount = answers?.pending ?? pendingQueue?.pendingAnswers ?? 0;

  return (
    <div className="space-y-4">
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Platform Users</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#101B3D]">{users.total}</span>
            <span className="text-xs text-emerald-600 font-medium">{users.activeHelpers} active helpers</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#64748B]">
            <span>{users.students} students</span>
            <span>•</span>
            <span>{users.helpers} helpers</span>
            <span>•</span>
            <span>{users.moderators} mods</span>
          </div>
        </div>

        {/* Academic Doubts & Resolution */}
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Platform Doubts</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <HelpCircle size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#101B3D]">{content.totalDoubts}</span>
            <span className="text-xs text-indigo-600 font-medium">{content.openDoubts} open</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#64748B]">
            <span>{content.resolvedDoubts} resolved</span>
            <span className="font-semibold text-emerald-600">{content.resolutionRate}% resolution</span>
          </div>
        </div>

        {/* Submitted Answers Total */}
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Submitted Answers</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#101B3D]">{content.totalAnswers}</span>
            <span className="text-xs text-emerald-600 font-medium">{approvedCount} approved</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#64748B]">
            <span>{pendingAnswersCount} pending review</span>
            <span>•</span>
            <span>{needsChangesCount} revisions</span>
          </div>
        </div>

        {/* Pending Moderation Queue */}
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Pending Moderation</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#101B3D]">{pendingQueue.totalPending}</span>
            <span className="text-xs text-amber-600 font-medium">items awaiting review</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#64748B]">
            <span>{pendingQueue.pendingAnswers} answers</span>
            <span>•</span>
            <span>{pendingQueue.pendingResources} guides</span>
            <span>•</span>
            <span>{pendingQueue.pendingReports} reports</span>
          </div>
        </div>
      </div>

      {/* Answer Verification Lifecycle Metrics Bar */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-4 shadow-xs">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#101B3D]">
            Answer Verification Lifecycle
          </h3>
          <span className="text-[0.7rem] text-[#64748B]">Real-time database counts</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-3">
            <div className="flex items-center gap-1.5 text-amber-700">
              <Clock size={14} />
              <span className="text-xs font-bold">Pending</span>
            </div>
            <p className="mt-1 text-xl font-black text-amber-900">{pendingAnswersCount}</p>
            <p className="text-[0.65rem] text-amber-700/80">Awaiting verification</p>
          </div>

          <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-3">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 size={14} />
              <span className="text-xs font-bold">Approved</span>
            </div>
            <p className="mt-1 text-xl font-black text-emerald-900">{approvedCount}</p>
            <p className="text-[0.65rem] text-emerald-700/80">Verified solutions</p>
          </div>

          <div className="rounded-xl border border-purple-200/70 bg-purple-50/50 p-3">
            <div className="flex items-center gap-1.5 text-purple-700">
              <AlertCircle size={14} />
              <span className="text-xs font-bold">Needs Changes</span>
            </div>
            <p className="mt-1 text-xl font-black text-purple-900">{needsChangesCount}</p>
            <p className="text-[0.65rem] text-purple-700/80">Revisions requested</p>
          </div>

          <div className="rounded-xl border border-red-200/70 bg-red-50/50 p-3">
            <div className="flex items-center gap-1.5 text-red-700">
              <XCircle size={14} />
              <span className="text-xs font-bold">Rejected</span>
            </div>
            <p className="mt-1 text-xl font-black text-red-900">{rejectedCount}</p>
            <p className="text-[0.65rem] text-red-700/80">Declined answers</p>
          </div>

          <div className="rounded-xl border border-blue-200/70 bg-blue-50/50 p-3">
            <div className="flex items-center gap-1.5 text-blue-700">
              <Flag size={14} />
              <span className="text-xs font-bold">Pending Reports</span>
            </div>
            <p className="mt-1 text-xl font-black text-blue-900">{pendingQueue.pendingReports}</p>
            <p className="text-[0.65rem] text-blue-700/80">Awaiting review</p>
          </div>
        </div>
      </div>
    </div>
  );
}

