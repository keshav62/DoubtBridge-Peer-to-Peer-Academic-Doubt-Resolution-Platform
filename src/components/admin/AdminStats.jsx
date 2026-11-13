'use client';

import { Users, HelpCircle, ShieldAlert, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';

export default function AdminStats({ metrics, loading = false }) {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-white border border-[#E5EAF2] p-5 animate-pulse flex flex-col justify-between">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-8 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const { users, content, pendingQueue } = metrics;

  return (
    <div className="space-y-4">
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Total Users</p>
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

        {/* Academic Doubts */}
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
            <span className="font-semibold text-emerald-600">{content.resolutionRate}% resolution rate</span>
          </div>
        </div>

        {/* Answers & Solutions */}
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Total Answers</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#101B3D]">{content.totalAnswers}</span>
            <span className="text-xs text-emerald-600 font-medium">peer solutions</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#64748B]">
            <span>Verified explanations and student responses</span>
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
    </div>
  );
}

