import Link from 'next/link';
import {
  HelpCircle,
  CheckCircle,
  Clock,
  Users,
  ArrowRight,
  Plus,
  BookOpen,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';

export const metadata = {
  title: 'Dashboard — DoubtBridge',
};

export default function DashboardOverviewPage() {
  const stats = [
    {
      label: 'Total Doubts',
      value: '18',
      sub: '+3 this week',
      icon: HelpCircle,
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#2563EB]',
    },
    {
      label: 'Resolved',
      value: '142',
      sub: '98% resolution rate',
      icon: CheckCircle,
      iconBg: 'bg-[#ECFDF5]',
      iconColor: 'text-[#10B981]',
    },
    {
      label: 'Pending',
      value: '4',
      sub: 'Awaiting helpers',
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Helping Others',
      value: '7',
      sub: 'Active sessions',
      icon: Users,
      iconBg: 'bg-[#EDE9FE]',
      iconColor: 'text-violet-600',
    },
  ];

  const recentDoubts = [
    {
      id: 'd1',
      title: 'How does Dijkstra algorithm handle negative weight cycles?',
      subject: 'Algorithms',
      status: 'CLAIMED',
      date: '2h ago',
    },
    {
      id: 'd2',
      title: 'Evaluating improper integrals with infinite discontinuities',
      subject: 'Calculus',
      status: 'OPEN',
      date: '1d ago',
    },
    {
      id: 'd3',
      title: 'Deriving the Maxwell-Boltzmann distribution from partition functions',
      subject: 'Physics',
      status: 'RESOLVED',
      date: '3d ago',
    },
  ];

  const STATUS_STYLES = {
    OPEN: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    CLAIMED: 'bg-amber-50 text-amber-700 border-amber-200',
    RESOLVED: 'bg-[#EDE9FE] text-violet-700 border-violet-200',
  };

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
      href: '/helpers',
      label: 'Help Others',
      desc: 'Answer questions, earn karma',
      icon: Users,
      iconBg: 'bg-[#EDE9FE]',
      iconColor: 'text-violet-600',
    },
    {
      href: '/knowledge',
      label: 'Knowledge Hub',
      desc: 'Explore curated resources',
      icon: TrendingUp,
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
    },
  ];

  return (
    <div className="space-y-7">
      {/* ── Welcome header ──────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101B3D]">
            Welcome back, Student! 👋
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Here's what's happening with your learning journey.
          </p>
        </div>
        <Link
          href="/doubts/new"
          className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-[#1D4ED8] transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          Ask a Doubt
        </Link>
      </div>

      {/* ── Stats row ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-[#E5EAF2] bg-white p-5 transition-all hover:border-[#BFDBFE] hover:shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.iconBg} ${s.iconColor}`}>
                  <Icon size={18} strokeWidth={2} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-[#101B3D] leading-none mb-1">
                {s.value}
              </div>
              <div className="text-xs font-semibold text-[#344568] mb-0.5">{s.label}</div>
              <div className="text-xs text-[#64748B]">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── Main content grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Recent Doubts — 2/3 width */}
        <div className="xl:col-span-2 rounded-2xl border border-[#E5EAF2] bg-white overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EAF2]">
            <h2 className="text-base font-bold text-[#101B3D]">Recent Doubts</h2>
            <Link
              href="/doubts"
              className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {recentDoubts.map((doubt) => (
              <div
                key={doubt.id}
                className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-[#F8FAFC] transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold ${STATUS_STYLES[doubt.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
                    >
                      {doubt.status}
                    </span>
                    <span className="text-xs font-medium text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full">
                      {doubt.subject}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#101B3D] leading-snug truncate">
                    {doubt.title}
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">{doubt.date}</p>
                </div>
                <Link
                  href={`/doubts/${doubt.id}`}
                  className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  View <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>

          {recentDoubts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF]">
                <HelpCircle size={22} className="text-[#2563EB]" />
              </div>
              <p className="text-sm font-semibold text-[#101B3D]">No doubts yet</p>
              <p className="text-xs text-[#64748B] mt-1">Ask your first doubt to get started.</p>
            </div>
          )}
        </div>

        {/* Quick Actions — 1/3 width */}
        <div className="rounded-2xl border border-[#E5EAF2] bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5EAF2]">
            <h2 className="text-base font-bold text-[#101B3D]">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-[#F8FAFC] group border border-transparent hover:border-[#E5EAF2]"
                >
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${action.iconBg} ${action.iconColor}`}>
                    <Icon size={17} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#101B3D] leading-tight">
                      {action.label}
                    </p>
                    <p className="text-xs text-[#64748B] leading-tight mt-0.5">
                      {action.desc}
                    </p>
                  </div>
                  <ArrowRight size={14} className="ml-auto flex-shrink-0 text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
