import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, MessageSquare, HelpCircle, TrendingUp, Award, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getHelperDashboardData(userId) {
  try {
    // Get helper's basic stats
    const [user, totalAnswers, claimedDoubts, openDoubts] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          reputation: true,
          isAvailable: true,
          subjects: true,
          _count: { select: { answers: true } },
        },
      }),
      prisma.answer.count({
        where: { authorId: userId },
      }),
      prisma.doubt.count({
        where: {
          helperId: userId,
          status: 'CLAIMED',
        },
      }),
      prisma.doubt.count({
        where: {
          status: 'OPEN',
        },
      }),
    ]);

    // Get recent answered doubts
    const recentAnswers = await prisma.answer.findMany({
      where: { authorId: userId },
      include: {
        doubt: {
          select: {
            id: true,
            title: true,
            subject: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      success: true,
      user,
      stats: {
        totalAnswers,
        claimedDoubts,
        openDoubts,
      },
      recentAnswers,
    };
  } catch (error) {
    console.error('Error fetching helper dashboard data:', error);
    return {
      success: false,
      error: 'Unable to load dashboard data. Please try again later.',
    };
  }
}

export default async function HelperDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Verify user is a helper
  if (user.role !== 'HELPER') {
    redirect('/dashboard');
  }

  const { success, user: helperData, stats, recentAnswers, error } = await getHelperDashboardData(user.id);

  if (!success) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      href: '/help-others',
      label: 'Help Others',
      desc: 'View and answer your assigned doubts',
      icon: HelpCircle,
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#2563EB]',
    },
    {
      href: '/all-doubts?status=OPEN',
      label: 'Available Doubts',
      desc: `${stats.openDoubts} doubts waiting for help`,
      icon: Users,
      iconBg: 'bg-[#ECFDF5]',
      iconColor: 'text-[#10B981]',
    },
    {
      href: '/solutions',
      label: 'My Solutions',
      desc: 'View and edit your answers',
      icon: MessageSquare,
      iconBg: 'bg-[#EDE9FE]',
      iconColor: 'text-violet-600',
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101B3D]">
              Helper Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]">
              HELPER
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Track your peer tutoring progress, assigned doubts, and reputation score.
          </p>
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <MessageSquare size={20} />
            </div>
            <span className="text-xs font-semibold text-[#64748B]">Total</span>
          </div>
          <p className="text-2xl font-bold text-[#101B3D]">{stats.totalAnswers}</p>
          <p className="text-xs text-[#64748B] mt-1">Answers Submitted</p>
        </div>

        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#10B981]">
              <HelpCircle size={20} />
            </div>
            <span className="text-xs font-semibold text-[#64748B]">Active</span>
          </div>
          <p className="text-2xl font-bold text-[#101B3D]">{stats.claimedDoubts}</p>
          <p className="text-xs text-[#64748B] mt-1">Claimed Doubts</p>
        </div>

        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDE9FE] text-violet-600">
              <Users size={20} />
            </div>
            <span className="text-xs font-semibold text-[#64748B]">Open</span>
          </div>
          <p className="text-2xl font-bold text-[#101B3D]">{stats.openDoubts}</p>
          <p className="text-xs text-[#64748B] mt-1">Available Doubts</p>
        </div>

        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Award size={20} />
            </div>
            <span className="text-xs font-semibold text-[#64748B]">Score</span>
          </div>
          <p className="text-2xl font-bold text-[#101B3D]">{helperData.reputation}</p>
          <p className="text-xs text-[#64748B] mt-1">Reputation Points</p>
        </div>
      </div>

      {/* ── Availability & Subjects ─────────────────────────────── */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-[#101B3D] mb-4">Your Helper Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-[#64748B] mb-2">Availability Status</p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                helperData.isAvailable
                  ? 'bg-[#ECFDF5] text-[#10B981]'
                  : 'bg-amber-50 text-amber-600'
              }`}>
                <span className={`h-2 w-2 rounded-full ${
                  helperData.isAvailable ? 'bg-[#10B981]' : 'bg-amber-600'
                }`} />
                {helperData.isAvailable ? 'Available' : 'Busy'}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#64748B] mb-2">Subjects</p>
            <p className="text-sm text-[#101B3D]">
              {helperData.subjects || 'No subjects specified'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-[#101B3D] mb-1">Quick Actions</h2>
        <p className="text-xs text-[#64748B] mb-5">
          Essential shortcuts for peer tutoring and doubt resolution
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
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

      {/* ── Recent Solutions ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-[#101B3D] mb-1">Recent Solutions</h2>
            <p className="text-xs text-[#64748B]">Your latest answers to community doubts</p>
          </div>
          <Link
            href="/solutions"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
          >
            View All
            <ChevronRight size={14} />
          </Link>
        </div>

        {recentAnswers.length === 0 ? (
          <div className="rounded-xl border border-[#E5EAF2] bg-[#F8FAFC] p-8 text-center">
            <MessageSquare size={32} className="mx-auto text-[#94A3B8] mb-3" />
            <p className="text-sm font-semibold text-[#101B3D] mb-1">No solutions yet</p>
            <p className="text-xs text-[#64748B] mb-4">
              Start helping others by answering open doubts
            </p>
            <Link
              href="/doubts"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-all"
            >
              Browse Doubts
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAnswers.map((answer) => (
              <Link
                key={answer.id}
                href={`/doubts/${answer.doubt.id}`}
                className="flex items-center justify-between rounded-xl border border-[#E5EAF2] p-4 transition-all hover:border-[#BFDBFE] hover:bg-[#F8FAFC]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#101B3D] truncate mb-1">
                    {answer.doubt.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#64748B]">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-[#EFF6FF] text-[#2563EB]">
                      {answer.doubt.subject}
                    </span>
                    <span>•</span>
                    <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  answer.doubt.status === 'RESOLVED'
                    ? 'bg-[#ECFDF5] text-[#10B981]'
                    : answer.doubt.status === 'ANSWERED'
                    ? 'bg-[#EFF6FF] text-[#2563EB]'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {answer.doubt.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
