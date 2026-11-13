'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, BookOpen, Flag, ExternalLink, Check, X, ShieldAlert } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

export default function AdminModerationQueue({ queue, loading }) {
  const [activeTab, setActiveTab] = useState('answers');

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 space-y-4">
        <div className="h-6 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-full rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!queue) return null;

  const { counts, answers = [], resources = [], reports = [] } = queue;

  return (
    <div className="rounded-2xl border border-[#E5EAF2] bg-white shadow-xs overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-[#E5EAF2] bg-[#F8FAFC] px-4 pt-3">
        <button
          type="button"
          onClick={() => setActiveTab('answers')}
          className={`flex items-center gap-2 border-b-2 px-4 pb-3 text-xs font-bold transition-all ${
            activeTab === 'answers'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#64748B] hover:text-[#101B3D]'
          }`}
        >
          <MessageSquare size={14} />
          Pending Answers
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[0.65rem] text-[#2563EB]">
            {counts.answers}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-2 border-b-2 px-4 pb-3 text-xs font-bold transition-all ${
            activeTab === 'resources'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#64748B] hover:text-[#101B3D]'
          }`}
        >
          <BookOpen size={14} />
          Knowledge Resources
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] text-emerald-700">
            {counts.resources}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 border-b-2 px-4 pb-3 text-xs font-bold transition-all ${
            activeTab === 'reports'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#64748B] hover:text-[#101B3D]'
          }`}
        >
          <Flag size={14} />
          Community Reports
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] text-amber-700">
            {counts.reports}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'answers' && (
          answers.length === 0 ? (
            <p className="text-center py-8 text-xs text-[#64748B]">No pending answers awaiting review.</p>
          ) : (
            <div className="space-y-3">
              {answers.map((ans) => (
                <div
                  key={ans.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#E5EAF2] p-3.5 hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#101B3D]">Doubt: {ans.doubt?.title}</span>
                      <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[0.65rem] font-medium text-[#2563EB]">
                        {ans.doubt?.subject}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] line-clamp-2 italic">
                      &quot;{ans.content}&quot;
                    </p>
                    <div className="flex items-center gap-2 text-[0.65rem] text-[#94A3B8]">
                      <span>By {ans.author?.name} ({ans.author?.role})</span>
                      <span>•</span>
                      <span>{timeAgo(ans.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/doubts/${ans.doubtId}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAF2] px-3 py-1.5 text-xs font-semibold text-[#101B3D] hover:bg-white transition-colors"
                    >
                      Inspect in Doubt <ExternalLink size={12} />
                    </Link>
                    <Link
                      href="/moderation"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'resources' && (
          resources.length === 0 ? (
            <p className="text-center py-8 text-xs text-[#64748B]">No pending knowledge resources awaiting review.</p>
          ) : (
            <div className="space-y-3">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#E5EAF2] p-3.5 hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#101B3D]">{res.title}</span>
                      <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[0.65rem] font-medium text-emerald-700">
                        {res.subject}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] line-clamp-2">
                      {res.description || res.content}
                    </p>
                    <div className="flex items-center gap-2 text-[0.65rem] text-[#94A3B8]">
                      <span>By {res.author?.name}</span>
                      <span>•</span>
                      <span>{timeAgo(res.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/knowledge/${res.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAF2] px-3 py-1.5 text-xs font-semibold text-[#101B3D] hover:bg-white transition-colors"
                    >
                      Read Article <ExternalLink size={12} />
                    </Link>
                    <Link
                      href="/moderation"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors"
                    >
                      Moderate
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'reports' && (
          reports.length === 0 ? (
            <p className="text-center py-8 text-xs text-[#64748B]">No pending community reports.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#E5EAF2] p-3.5 hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-red-600">Report: {rep.reason}</span>
                    </div>
                    <p className="text-xs text-[#64748B]">
                      Reported by {rep.reporter?.name} • {timeAgo(rep.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href="/admin/reports"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors"
                    >
                      Resolve in Reports
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

