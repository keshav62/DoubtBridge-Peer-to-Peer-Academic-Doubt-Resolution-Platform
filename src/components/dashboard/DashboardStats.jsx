'use client';

import {
  HelpCircle,
  CheckCircle,
  Clock,
  Users,
  MessageSquare,
  TrendingUp,
  Award,
  ShieldAlert,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import StatCard from './StatCard';

export default function DashboardStats({ role = 'STUDENT', stats = {} }) {
  let cards = [];

  if (role === 'STUDENT') {
    cards = [
      {
        label: 'My Doubts',
        value: stats.totalDoubts ?? 0,
        sub: `${stats.openDoubts ?? 0} currently open`,
        icon: HelpCircle,
        iconBg: 'bg-[#EFF6FF]',
        iconColor: 'text-[#2563EB]',
      },
      {
        label: 'Resolved Solutions',
        value: stats.resolvedDoubts ?? 0,
        sub: `${stats.acceptedSolutionsReceived ?? 0} accepted answers`,
        icon: CheckCircle,
        iconBg: 'bg-[#ECFDF5]',
        iconColor: 'text-[#10B981]',
      },
      {
        label: 'In Progress / Answered',
        value: (stats.inProgressDoubts ?? 0) + (stats.answeredDoubts ?? 0),
        sub: `${stats.answeredDoubts ?? 0} ready for review`,
        icon: Clock,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
      },
      {
        label: 'Peer Reputation',
        value: `${stats.reputation ?? 0} Rep`,
        sub: `${stats.totalAnswersSubmitted ?? 0} answers contributed`,
        icon: Award,
        iconBg: 'bg-[#EDE9FE]',
        iconColor: 'text-violet-600',
      },
    ];
  } else if (role === 'HELPER') {
    cards = [
      {
        label: 'Available Doubts',
        value: stats.availableDoubts ?? 0,
        sub: 'Waiting for peer helpers',
        icon: HelpCircle,
        iconBg: 'bg-[#EFF6FF]',
        iconColor: 'text-[#2563EB]',
      },
      {
        label: 'Accepted Solutions',
        value: stats.acceptedSolutions ?? 0,
        sub: 'Solutions accepted by peers',
        icon: CheckCircle,
        iconBg: 'bg-[#ECFDF5]',
        iconColor: 'text-[#10B981]',
      },
      {
        label: 'Active Claimed Doubts',
        value: (stats.claimedDoubts ?? 0) + (stats.activeAssignments ?? 0),
        sub: `${stats.activeAssignments ?? 0} in active assignment`,
        icon: Users,
        iconBg: 'bg-cyan-50',
        iconColor: 'text-cyan-600',
      },
      {
        label: 'Helper Reputation',
        value: `${stats.reputation ?? 0} Rep`,
        sub: `${stats.approvedAnswers ?? 0} approved answers`,
        icon: Award,
        iconBg: 'bg-[#EDE9FE]',
        iconColor: 'text-violet-600',
      },
    ];
  } else if (role === 'MODERATOR') {
    cards = [
      {
        label: 'Pending Answers',
        value: stats.pendingAnswers ?? 0,
        sub: 'Awaiting moderation review',
        icon: Clock,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
      },
      {
        label: 'Approved Answers',
        value: stats.approvedAnswers ?? 0,
        sub: 'Live & visible to students',
        icon: CheckCircle,
        iconBg: 'bg-[#ECFDF5]',
        iconColor: 'text-[#10B981]',
      },
      {
        label: 'Reported Content',
        value: stats.pendingReports ?? 0,
        sub: 'Student & answer flags',
        icon: ShieldAlert,
        iconBg: 'bg-red-50',
        iconColor: 'text-red-600',
      },
      {
        label: 'Reviews by You',
        value: stats.reviewsByMe ?? 0,
        sub: `Out of ${stats.totalReviews ?? 0} total reviews`,
        icon: UserCheck,
        iconBg: 'bg-[#EFF6FF]',
        iconColor: 'text-[#2563EB]',
      },
    ];
  } else if (role === 'ADMIN') {
    cards = [
      {
        label: 'Total Platform Users',
        value: stats.totalUsers ?? 0,
        sub: `${stats.totalStudents ?? 0} students · ${stats.totalHelpers ?? 0} helpers`,
        icon: Users,
        iconBg: 'bg-[#EFF6FF]',
        iconColor: 'text-[#2563EB]',
      },
      {
        label: 'Total Academic Doubts',
        value: stats.totalDoubts ?? 0,
        sub: `${stats.resolvedDoubts ?? 0} marked resolved`,
        icon: HelpCircle,
        iconBg: 'bg-cyan-50',
        iconColor: 'text-cyan-600',
      },
      {
        label: 'Resolution Rate',
        value: `${stats.resolutionRate ?? 0}%`,
        sub: `${stats.totalAnswers ?? 0} total answers submitted`,
        icon: TrendingUp,
        iconBg: 'bg-[#ECFDF5]',
        iconColor: 'text-[#10B981]',
      },
      {
        label: 'Pending Moderation',
        value: stats.pendingModeration ?? 0,
        sub: `${stats.pendingAnswers ?? 0} answers · ${stats.pendingReports ?? 0} reports`,
        icon: ShieldAlert,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
      },
    ];
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          sub={card.sub}
          icon={card.icon}
          iconBg={card.iconBg}
          iconColor={card.iconColor}
        />
      ))}
    </div>
  );
}

