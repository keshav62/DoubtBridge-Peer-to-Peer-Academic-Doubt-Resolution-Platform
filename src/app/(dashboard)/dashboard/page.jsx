'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  BookOpen,
  Users,
  TrendingUp,
  Sparkles,
  Award,
} from 'lucide-react';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentDoubts from '@/components/dashboard/RecentDoubts';
import RecentActivity from '@/components/dashboard/RecentActivity';
import DoubtStatusChart from '@/components/dashboard/DoubtStatusChart';
import DoubtTrendChart from '@/components/dashboard/DoubtTrendChart';
import SubjectDistributionChart from '@/components/dashboard/SubjectDistributionChart';

export default function DashboardOverviewPage() {
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [analyticsDays, setAnalyticsDays] = useState(30);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/overview');
      if (!res.ok) {
        throw new Error(`Failed to load dashboard overview (${res.status})`);
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch overview data');
      }
      setOverview(data);
    } catch (err) {
      console.error('Overview fetch error:', err);
      setError(err.message);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async (days) => {
    try {
      setLoadingAnalytics(true);
      const res = await fetch(`/api/dashboard/analytics?days=${days}`);
      if (!res.ok) {
        throw new Error(`Failed to load analytics (${res.status})`);
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch analytics data');
      }
      setAnalytics(data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchOverview();
    fetchAnalytics(analyticsDays);
  }, [fetchOverview, fetchAnalytics, analyticsDays]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    await Promise.all([fetchOverview(), fetchAnalytics(analyticsDays)]);
    setIsRefreshing(false);
  };

  // Change analytics time range
  const handleDaysChange = (newDays) => {
    setAnalyticsDays(newDays);
  };

  const user = overview?.user || {};
  const role = overview?.role || user.role || 'STUDENT';
  const stats = overview?.stats || {};
  const recentDoubts = overview?.recentDoubts || [];
  const recentActivity = overview?.recentActivity || [];

  const quickActions = [
    {
      href: '/doubts/new',
      label: 'Ask a Doubt',
      desc: 'Post a question for peer helpers',
      icon: MessageSquare,
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#2563EB]',
    },
    {
      href: '/doubts',
      label: 'Browse Doubts',
      desc: 'Explore questions from peers',
      icon: BookOpen,
      iconBg: 'bg-[#ECFDF5]',
      iconColor: 'text-[#10B981]',
    },
    {
      href: '/doubts?status=OPEN',
      label: 'Help Others',
      desc: 'Answer open doubts & earn karma',
      icon: Users,
      iconBg: 'bg-[#EDE9FE]',
      iconColor: 'text-violet-600',
    },
    {
      href: '/knowledge',
      label: 'Knowledge Hub',
      desc: 'Explore approved peer solutions',
      icon: TrendingUp,
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* ── Top Header & Greeting ──────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101B3D]">
              {loadingOverview ? (
                <span className="inline-block h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
              ) : (
                `Welcome back, ${user.name || 'Scholar'}! 👋`
              )}
            </h1>
            {!loadingOverview && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]">
                <Sparkles size={11} />
                {role}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            {role === 'STUDENT' && "Here's what's happening with your academic questions and answers."}
            {role === 'HELPER' && "Here's your peer tutoring overview, claim status, and reputation score."}
            {role === 'MODERATOR' && "Here's your moderation queue, flagged content, and community audits."}
            {role === 'ADMIN' && "Complete institutional metrics, user distribution, and doubt throughput."}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || loadingOverview}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#344568] hover:border-[#BFDBFE] hover:bg-[#F8FAFC] transition-all disabled:opacity-50 shadow-xs"
            title="Refresh dashboard data"
          >
            <RefreshCw
              size={14}
              className={`${isRefreshing ? 'animate-spin text-[#2563EB]' : 'text-[#64748B]'}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/doubts/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-[#1D4ED8] transition-all"
          >
            <Plus size={16} />
            Ask a Doubt
          </Link>
        </div>
      </div>

      {/* ── Error Banner (if any) ─────────────────────────────── */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="font-bold underline hover:no-underline ml-4"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── Role-Tailored Stats Row ───────────────────────────── */}
      {loadingOverview ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-[#E5EAF2] bg-white p-5 animate-pulse flex flex-col justify-between"
            >
              <div className="h-8 w-8 rounded-xl bg-slate-100" />
              <div className="space-y-1.5">
                <div className="h-6 w-16 rounded bg-slate-200" />
                <div className="h-3 w-28 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DashboardStats role={role} stats={stats} />
      )}

      {/* ── Analytics Visualizations ──────────────────────────── */}
      <div className="space-y-6">
        {/* Trend Line/Area Chart */}
        <DoubtTrendChart
          data={analytics?.creationTrend || []}
          days={analyticsDays}
          onDaysChange={handleDaysChange}
          isLoading={loadingAnalytics}
        />

        {/* 2-Column Grid: Status Distribution & Subject Distribution */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DoubtStatusChart data={analytics?.statusDistribution || {}} />
          <SubjectDistributionChart data={analytics?.subjectDistribution || []} />
        </div>
      </div>

      {/* ── Operations: Recent Doubts & Live Activity ──────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Doubts — 2/3 width */}
        <div className="xl:col-span-2">
          {loadingOverview ? (
            <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 h-80 animate-pulse" />
          ) : (
            <RecentDoubts
              doubts={recentDoubts}
              role={role}
              title={role === 'STUDENT' ? 'Your Recent Doubts' : 'Recent Academic Doubts'}
            />
          )}
        </div>

        {/* Live Activity Stream — 1/3 width */}
        <div className="xl:col-span-1">
          {loadingOverview ? (
            <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 h-80 animate-pulse" />
          ) : (
            <RecentActivity activities={recentActivity} />
          )}
        </div>
      </div>

      {/* ── Quick Actions Grid ─────────────────────────────────── */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-[#101B3D] mb-1">Quick Actions</h2>
        <p className="text-xs text-[#64748B] mb-5">
          Essential shortcuts for academic collaboration & knowledge sharing
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href + action.label}
                href={action.href}
                className="flex items-center gap-3.5 rounded-xl border border-[#E5EAF2] p-4 transition-all hover:border-[#BFDBFE] hover:bg-[#F8FAFC] group"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.iconBg} ${action.iconColor} transition-transform group-hover:scale-105`}
                >
                  <Icon size={19} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#101B3D] leading-tight group-hover:text-[#2563EB] transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-[#64748B] leading-tight mt-0.5 truncate">
                    {action.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
