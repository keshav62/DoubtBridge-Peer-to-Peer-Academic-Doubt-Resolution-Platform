'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, Award, HelpCircle, CheckCircle, ThumbsUp,
  Star, BookOpen, BarChart2, Clock, ChevronRight, Loader2,
  AlertCircle,
} from 'lucide-react';

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = '#2563EB', sub }) {
  return (
    <div className="rounded-xl border border-[#E5EAF2] bg-white p-5 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center gap-2 text-[#64748B]">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${color}1A` }}>
          <Icon size={16} style={{ color }} />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-3xl font-extrabold text-[#101B3D]">{value}</p>
      {sub && <p className="text-xs text-[#64748B]">{sub}</p>}
    </div>
  );
}

// ── Mini Bar Chart ─────────────────────────────────────────────────────────────
function MiniBarChart({ data = [], color = '#2563EB', label }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-[#64748B] uppercase tracking-wide">{label}</p>
      <div className="flex items-end gap-1 h-16">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center flex-1 gap-0.5">
            <div
              className="w-full rounded-t transition-all duration-300"
              style={{
                height: `${Math.max(4, Math.round((d.value / max) * 56))}px`,
                background: color,
                opacity: d.value === 0 ? 0.2 : 1,
              }}
            />
            <span className="text-[9px] text-[#94A3B8]">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Achievement Badge ──────────────────────────────────────────────────────────
function AchievementBadge({ achievement }) {
  const pct = achievement.target > 0 ? Math.min(100, Math.round((achievement.progress / achievement.target) * 100)) : 0;
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-2 transition-all ${achievement.earned ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#E5EAF2] bg-white opacity-70'}`}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{achievement.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm truncate ${achievement.earned ? 'text-[#2563EB]' : 'text-[#101B3D]'}`}>{achievement.title}</p>
          <p className="text-xs text-[#64748B]">{achievement.description}</p>
        </div>
        {achievement.earned && <CheckCircle size={16} className="text-[#2563EB] flex-shrink-0" />}
      </div>
      {!achievement.earned && (
        <div>
          <div className="h-1.5 w-full rounded-full bg-[#E5EAF2]">
            <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-[10px] text-[#94A3B8]">{achievement.progress}/{achievement.target}</p>
        </div>
      )}
    </div>
  );
}

// ── Timeline Item ──────────────────────────────────────────────────────────────
function TimelineItem({ item }) {
  const typeConfig = {
    DOUBT_CREATED: { icon: HelpCircle, label: 'Created doubt', color: '#2563EB' },
    ANSWER_SUBMITTED: { icon: BookOpen, label: 'Answered', color: '#06B6D4' },
    ANSWER_APPROVED: { icon: CheckCircle, label: 'Answer approved', color: '#10B981' },
    ANSWER_ACCEPTED: { icon: Star, label: 'Answer accepted', color: '#F59E0B' },
  };
  const cfg = typeConfig[item.type] || { icon: Clock, label: item.type, color: '#94A3B8' };
  const Icon = cfg.icon;

  return (
    <div className="flex gap-3 pb-4">
      <div className="flex flex-col items-center">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full" style={{ background: `${cfg.color}1A` }}>
          <Icon size={12} style={{ color: cfg.color }} />
        </span>
        <div className="mt-1 flex-1 w-px bg-[#E5EAF2]" />
      </div>
      <div className="pb-1 min-w-0">
        <p className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
        <p className="text-sm text-[#101B3D] font-medium leading-snug truncate">
          {item.title || item.doubtTitle || (item.content ? `"${item.content}…"` : 'Activity')}
        </p>
        {item.subject && <span className="inline-block mt-0.5 rounded-full border border-[#E5EAF2] px-2 py-0.5 text-[10px] text-[#64748B]">{item.subject}</span>}
        <p className="mt-0.5 text-[10px] text-[#94A3B8]">{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ProgressPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/progress');
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load');
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-[#64748B]">
        <Loader2 size={32} className="animate-spin text-[#2563EB]" />
        <p className="text-sm">Loading your progress…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <AlertCircle size={36} className="text-red-400" />
        <p className="text-[#101B3D] font-semibold">Failed to load progress</p>
        <p className="text-sm text-[#64748B]">{error}</p>
        <button onClick={load} className="mt-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors">
          Try again
        </button>
      </div>
    );
  }

  const { stats, weeklyActivity, subjectData, timeline, achievements } = data;
  const earnedCount = achievements.filter((a) => a.earned).length;

  const doubtChartData = weeklyActivity.days.map((d, i) => ({ label: d, value: weeklyActivity.doubts[i] }));
  const answerChartData = weeklyActivity.days.map((d, i) => ({ label: d, value: weeklyActivity.answers[i] }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#101B3D] flex items-center gap-2">
          <TrendingUp size={24} className="text-[#2563EB]" /> My Progress
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">Track your learning journey and contributions on DoubtBridge.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={HelpCircle}   label="Doubts Created"   value={stats.totalDoubts}    color="#2563EB" sub={`${stats.resolvedDoubts} resolved`} />
        <StatCard icon={BookOpen}     label="Answers Given"    value={stats.totalAnswers}    color="#06B6D4" sub={`${stats.approvedAnswers} approved`} />
        <StatCard icon={CheckCircle}  label="Accepted Answers" value={stats.acceptedAnswers} color="#10B981" sub={`${stats.approvalRate}% approval rate`} />
        <StatCard icon={ThumbsUp}     label="Total Upvotes"    value={stats.totalUpvotes}    color="#F59E0B" sub={`${stats.reputation} reputation pts`} />
      </div>

      {/* Weekly Activity Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#E5EAF2] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-[#2563EB]" />
            <h2 className="font-semibold text-sm text-[#101B3D]">Weekly Activity</h2>
          </div>
          <MiniBarChart data={doubtChartData} color="#2563EB" label="Doubts Created (last 7 days)" />
          <div className="mt-4">
            <MiniBarChart data={answerChartData} color="#06B6D4" label="Answers Given (last 7 days)" />
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="rounded-xl border border-[#E5EAF2] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-[#2563EB]" />
            <h2 className="font-semibold text-sm text-[#101B3D]">Subject Distribution</h2>
          </div>
          {subjectData.length === 0 ? (
            <p className="text-sm text-[#94A3B8] text-center py-8">No doubt data yet.</p>
          ) : (
            <div className="space-y-2">
              {subjectData.slice(0, 6).map((s) => {
                const max = subjectData[0]?.count || 1;
                const pct = Math.round((s.count / max) * 100);
                return (
                  <div key={s.subject} className="flex items-center gap-2">
                    <span className="text-xs text-[#64748B] w-24 truncate">{s.subject}</span>
                    <div className="flex-1 h-2 rounded-full bg-[#F1F5F9]">
                      <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-[#344568] w-6 text-right">{s.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-[#101B3D] flex items-center gap-1.5">
            <Award size={18} className="text-[#F59E0B]" /> Achievements
          </h2>
          <span className="text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] rounded-full px-2.5 py-1">
            {earnedCount}/{achievements.length} earned
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {achievements.map((a) => <AchievementBadge key={a.id} achievement={a} />)}
        </div>
      </div>

      {/* Activity Timeline */}
      <div>
        <h2 className="font-bold text-[#101B3D] mb-4 flex items-center gap-1.5">
          <Clock size={18} className="text-[#06B6D4]" /> Recent Activity
        </h2>
        {timeline.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E5EAF2] p-8 text-center">
            <p className="text-sm text-[#94A3B8]">No activity yet. Start by asking a doubt or answering one!</p>
          </div>
        ) : (
          <div className="rounded-xl border border-[#E5EAF2] bg-white p-5 shadow-sm">
            {timeline.map((item, i) => <TimelineItem key={`${item.type}-${item.id}-${i}`} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
