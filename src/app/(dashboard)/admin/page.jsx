'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Users,
  ShieldCheck,
  Flag,
  Activity,
  ArrowRight,
  HelpCircle,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import AdminStats from '@/components/admin/AdminStats';
import AdminAccountStatusBadge from '@/components/admin/AdminAccountStatusBadge';
import { timeAgo } from '@/lib/utils';

export default function AdminOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/overview');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-white shadow-sm shadow-blue-500/20">
            <Shield size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-[#101B3D]">
                Platform Control Center
              </h1>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#2563EB] border border-blue-200/60">
                Admin Mode
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Live operational health, user governance, moderation queues, and audit log history.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchOverview(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 self-start sm:self-center rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2 text-xs font-semibold text-[#101B3D] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Metrics'}
        </button>
      </div>

      {/* KPI Stats */}
      <AdminStats metrics={data?.metrics} loading={loading} />

      {/* Quick Navigation Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/users"
          className="group flex items-center justify-between rounded-2xl border border-[#E5EAF2] bg-white p-4 shadow-xs hover:border-[#2563EB]/40 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] group-hover:scale-105 transition-transform">
              <Users size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#101B3D]">User Directory</p>
              <p className="text-xs text-[#64748B]">Manage roles &amp; status</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-[#94A3B8] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/admin/moderation"
          className="group flex items-center justify-between rounded-2xl border border-[#E5EAF2] bg-white p-4 shadow-xs hover:border-[#2563EB]/40 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#101B3D]">Moderation Hub</p>
              <p className="text-xs text-[#64748B]">Answers &amp; guides queue</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-[#94A3B8] group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/admin/reports"
          className="group flex items-center justify-between rounded-2xl border border-[#E5EAF2] bg-white p-4 shadow-xs hover:border-[#2563EB]/40 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <Flag size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#101B3D]">Community Reports</p>
              <p className="text-xs text-[#64748B]">Review flagged content</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-[#94A3B8] group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/admin/audit-logs"
          className="group flex items-center justify-between rounded-2xl border border-[#E5EAF2] bg-white p-4 shadow-xs hover:border-[#2563EB]/40 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
              <Activity size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#101B3D]">Audit Logs</p>
              <p className="text-xs text-[#64748B]">Security &amp; admin events</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-[#94A3B8] group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* Two-column operational dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#101B3D]">Recent Registrations</h2>
              <p className="text-xs text-[#64748B]">New student and helper accounts</p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : data?.recentRegistrations?.length === 0 ? (
            <p className="text-xs text-[#64748B] py-6 text-center">No registrations recorded yet.</p>
          ) : (
            <div className="divide-y divide-[#E5EAF2]">
              {data?.recentRegistrations?.map((u) => (
                <div key={u.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[#2563EB] text-xs font-bold">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-xs font-bold text-[#101B3D] hover:text-[#2563EB] transition-colors"
                      >
                        {u.name}
                      </Link>
                      <p className="text-[0.65rem] text-[#64748B]">{u.email} • {u.department || 'General'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-[#344568]">
                      {u.role}
                    </span>
                    <AdminAccountStatusBadge isActive={u.isActive} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit Activities */}
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#101B3D]">Recent Administrative Actions</h2>
              <p className="text-xs text-[#64748B]">Real-time append-only security logs</p>
            </div>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              View logs
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : data?.recentAuditLogs?.length === 0 ? (
            <div className="text-center py-8">
              <Clock size={20} className="text-[#94A3B8] mx-auto mb-1.5" />
              <p className="text-xs text-[#64748B]">No administrative actions recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5EAF2]">
              {data?.recentAuditLogs?.map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#101B3D]">{log.action}</span>
                      <span className="text-[0.65rem] text-[#94A3B8] font-mono">
                        {log.targetType}:{log.targetId.slice(0, 8)}...
                      </span>
                    </div>
                    <p className="text-[0.65rem] text-[#64748B]">
                      By {log.actor?.name} ({log.actor?.role})
                    </p>
                  </div>
                  <span className="text-[0.65rem] text-[#94A3B8] whitespace-nowrap">
                    {timeAgo(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
