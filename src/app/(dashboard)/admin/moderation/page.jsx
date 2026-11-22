'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ChevronLeft,
  RefreshCw,
  ExternalLink,
  BarChart3,
  ListOrdered,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Award,
  BookOpen,
} from 'lucide-react';
import AdminModerationQueue from '@/components/admin/AdminModerationQueue';

export default function AdminModerationPage() {
  const [activeView, setActiveView] = useState('queue'); // 'queue' | 'analytics'
  const [queue, setQueue] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQueue = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/moderation');
      const json = await res.json();
      if (json.success) {
        setQueue(json);
      }
    } catch (err) {
      console.error('Failed to fetch moderation queue:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch('/api/admin/analytics/moderation');
      const json = await res.json();
      if (json.success) {
        setAnalytics(json);
      }
    } catch (err) {
      console.error('Failed to fetch moderation analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-[#101B3D]">
              Platform Moderation Hub
            </h1>
            {queue?.counts && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                {queue.counts.total} Awaiting Decision
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Unified administrative hub for answer verification, knowledge guides review, and moderation quality analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/answers"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors"
          >
            Answer Verification Center <ExternalLink size={13} />
          </Link>
          <button
            type="button"
            onClick={() => {
              if (activeView === 'queue') fetchQueue(true);
              else fetchAnalytics();
            }}
            disabled={loading || refreshing || analyticsLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2 text-xs font-semibold text-[#101B3D] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing || analyticsLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5EAF2] pb-2">
        <button
          type="button"
          onClick={() => setActiveView('queue')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeView === 'queue'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'border border-[#E5EAF2] bg-white text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#101B3D]'
          }`}
        >
          <ListOrdered size={14} />
          Unified Queue
        </button>

        <button
          type="button"
          onClick={() => setActiveView('analytics')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeView === 'analytics'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'border border-[#E5EAF2] bg-white text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#101B3D]'
          }`}
        >
          <BarChart3 size={14} />
          Moderation Analytics &amp; Quality
        </button>
      </div>

      {/* Tab 1: Queue */}
      {activeView === 'queue' && (
        <AdminModerationQueue queue={queue} loading={loading} />
      )}

      {/* Tab 2: Analytics */}
      {activeView === 'analytics' && (
        <div className="space-y-6">
          {analyticsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-white border border-[#E5EAF2] p-5 animate-pulse" />
              ))}
            </div>
          ) : !analytics ? (
            <p className="text-center py-12 text-xs text-[#64748B]">Unable to load analytics.</p>
          ) : (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="rounded-2xl border border-[#E5EAF2] bg-white p-4 shadow-xs">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#64748B]">
                    Total Reviewed
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#101B3D]">
                    {analytics.summary.totalReviews}
                  </p>
                  <p className="text-[0.65rem] text-[#94A3B8] mt-1">Peer answers audited</p>
                </div>

                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-xs">
                  <div className="flex items-center justify-between text-emerald-800">
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider">Approval Rate</p>
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="mt-2 text-2xl font-black text-emerald-950">
                    {analytics.summary.approvalRate}%
                  </p>
                  <p className="text-[0.65rem] text-emerald-700/80 mt-1">
                    {analytics.summary.approvedReviews} answers approved
                  </p>
                </div>

                <div className="rounded-2xl border border-purple-200/80 bg-purple-50/50 p-4 shadow-xs">
                  <div className="flex items-center justify-between text-purple-800">
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider">Needs Changes</p>
                    <AlertCircle size={16} />
                  </div>
                  <p className="mt-2 text-2xl font-black text-purple-950">
                    {analytics.summary.needsChangesRate}%
                  </p>
                  <p className="text-[0.65rem] text-purple-700/80 mt-1">
                    {analytics.summary.needsChangesReviews} revisions requested
                  </p>
                </div>

                <div className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-4 shadow-xs">
                  <div className="flex items-center justify-between text-rose-800">
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider">Rejection Rate</p>
                    <XCircle size={16} />
                  </div>
                  <p className="mt-2 text-2xl font-black text-rose-950">
                    {analytics.summary.rejectionRate}%
                  </p>
                  <p className="text-[0.65rem] text-rose-700/80 mt-1">
                    {analytics.summary.rejectedReviews} answers rejected
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 shadow-xs">
                  <div className="flex items-center justify-between text-blue-800">
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider">Avg Turnaround</p>
                    <Clock size={16} />
                  </div>
                  <p className="mt-2 text-2xl font-black text-blue-950">
                    {analytics.summary.avgTurnaroundMinutes < 60
                      ? `${analytics.summary.avgTurnaroundMinutes}m`
                      : `${Math.round(analytics.summary.avgTurnaroundMinutes / 60)}h`}
                  </p>
                  <p className="text-[0.65rem] text-blue-700/80 mt-1">Submission to decision</p>
                </div>
              </div>

              {/* Quality & Methodology Note */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 text-xs text-amber-900 leading-relaxed">
                <span className="font-bold">Moderation Methodology Notice:</span> Moderation decisions represent quality, pedagogical clarity, and academic integrity safety checkpoints. An approval rate is a measure of community compliance and review volume; it is not an absolute mathematical proof of conceptual accuracy.
              </div>

              {/* Two Column Section: Daily Reviews & Moderator Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Reviews Breakdown (Last 14 Days) */}
                <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#101B3D]">
                      Daily Reviews Activity (Last 14 Days)
                    </h3>
                    <p className="text-xs text-[#64748B]">Volume of decisions rendered each day</p>
                  </div>

                  <div className="space-y-2">
                    {analytics.dailyReviews?.map((d) => {
                      const maxDaily = Math.max(...analytics.dailyReviews.map((item) => item.count), 1);
                      const pct = Math.min(Math.round((d.count / maxDaily) * 100), 100);

                      return (
                        <div key={d.date} className="flex items-center gap-3 text-xs">
                          <span className="w-20 text-[0.7rem] font-mono text-[#64748B] flex-shrink-0">
                            {d.date.slice(5)}
                          </span>
                          <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden flex">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4]"
                            />
                          </div>
                          <span className="w-8 text-right font-bold text-[#101B3D] text-[0.7rem]">
                            {d.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Moderator Activity Leaderboard */}
                <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#101B3D]">Moderator Activity Leaderboard</h3>
                    <p className="text-xs text-[#64748B]">
                      Verified administrative contributions across moderators
                    </p>
                  </div>

                  {analytics.moderatorActivity?.length === 0 ? (
                    <p className="text-center py-8 text-xs text-[#64748B]">
                      No moderator activities recorded yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-[#E5EAF2]">
                      {analytics.moderatorActivity?.map((mod, idx) => (
                        <div key={mod.reviewerId} className="py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[0.7rem] font-bold text-[#2563EB]">
                              #{idx + 1}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-[#101B3D]">{mod.name}</p>
                              <p className="text-[0.65rem] text-[#64748B]">{mod.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-[#101B3D]">
                              {mod.totalReviews}
                            </span>
                            <span className="text-[0.65rem] text-[#64748B] block">reviews completed</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Subject Quality Breakdown Table */}
              <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#101B3D]">Subject Quality Distribution</h3>
                  <p className="text-xs text-[#64748B]">
                    Decisions and verification outcomes by academic subject
                  </p>
                </div>

                {analytics.subjectDistribution?.length === 0 ? (
                  <p className="text-center py-6 text-xs text-[#64748B]">No subject data available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B]">
                        <tr>
                          <th className="px-4 py-2.5">Subject</th>
                          <th className="px-4 py-2.5">Total Audited</th>
                          <th className="px-4 py-2.5">Approved</th>
                          <th className="px-4 py-2.5">Needs Changes</th>
                          <th className="px-4 py-2.5">Rejected</th>
                          <th className="px-4 py-2.5 text-right">Approval %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5EAF2]">
                        {analytics.subjectDistribution?.map((sub) => {
                          const rate = sub.total > 0 ? Math.round((sub.approved / sub.total) * 100) : 0;
                          return (
                            <tr key={sub.subject} className="hover:bg-[#F8FAFC]">
                              <td className="px-4 py-2.5 font-bold text-[#101B3D]">{sub.subject}</td>
                              <td className="px-4 py-2.5 font-semibold text-[#344568]">{sub.total}</td>
                              <td className="px-4 py-2.5 text-emerald-700 font-medium">{sub.approved}</td>
                              <td className="px-4 py-2.5 text-purple-700 font-medium">{sub.needsChanges}</td>
                              <td className="px-4 py-2.5 text-rose-700 font-medium">{sub.rejected}</td>
                              <td className="px-4 py-2.5 text-right font-bold text-[#101B3D]">
                                {rate}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
