'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  LayoutDashboard,
  HelpCircle,
  Users,
  Database,
  ShieldCheck,
  TrendingUp,
  Bookmark,
  MessageSquare,
  Trophy,
  Bell,
  Settings,
  ChevronDown,
  X,
  Sparkles,
} from 'lucide-react';

/**
 * Navigation configuration.
 * Add `roles: ['moderator']` to restrict an item to specific roles.
 */
const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard',      href: '/dashboard',   icon: LayoutDashboard },
      { label: 'My Doubts',      href: '/doubts',      icon: HelpCircle },
      { label: 'Help Others',    href: '/helpers',     icon: Users },
      { label: 'Knowledge Base', href: '/knowledge',   icon: Database },
      { label: 'Moderation',     href: '/moderation',  icon: ShieldCheck, roles: ['moderator', 'admin'] },
    ],
  },
  {
    label: 'Learning',
    items: [
      { label: 'My Progress', href: '/progress',  icon: TrendingUp },
      { label: 'Bookmarks',   href: '/bookmarks', icon: Bookmark },
    ],
  },
  {
    label: 'Community',
    items: [
      { label: 'Discussion',  href: '/discussion',  icon: MessageSquare },
      { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Notifications', href: '/notifications', icon: Bell },
      { label: 'Settings',      href: '/settings',      icon: Settings },
    ],
  },
];

export default function Sidebar({ isOpen = false, onClose, userRole }) {
  const pathname = usePathname();

  const isVisible = (item) => {
    if (!item.roles) return true;
    if (!userRole) return false;
    return item.roles.includes(userRole);
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* ── Mobile backdrop ──────────────────────────────────── */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-[#101B3D]/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ── Sidebar panel ────────────────────────────────────── */}
      <aside
        role="navigation"
        aria-label="Main navigation"
        data-open={isOpen ? 'true' : 'false'}
        className={[
          // Base
          'fixed top-0 left-0 z-50 h-screen w-[260px] flex flex-col',
          'bg-white border-r border-[#E5EAF2] overflow-y-auto',
          'transition-transform duration-250 ease-in-out',
          // Mobile: slide in/out
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible, in-flow (override fixed)
          'md:relative md:translate-x-0 md:flex-shrink-0',
        ].join(' ')}
      >
        {/* ── Branding ─────────────────────────────────────────── */}
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-center justify-between">
            {/* Logo + wordmark — matches landing page LandingNavbar */}
            <div className="flex items-center gap-2.5">
              {/* Two-bar logo identical to landing navbar */}
              <div className="flex items-end gap-0.5 h-7">
                <span className="w-2 h-5 rounded-full bg-[#2563EB]" />
                <span className="w-2 h-7 rounded-full bg-[#06B6D4]" />
              </div>
              <div className="flex flex-col leading-none">
                <p className="text-[1rem] font-extrabold tracking-tight text-[#101B3D]">
                  DoubtBridge
                </p>
                <p className="mt-0.5 text-[0.6rem] tracking-widest font-semibold uppercase text-[#64748B]">
                  Learn · Ask · Solve
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              aria-label="Close navigation menu"
              className="flex md:hidden items-center justify-center rounded-lg p-1.5 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#101B3D] focus-visible:outline-2 focus-visible:outline-[#2563EB] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-[#E5EAF2]" />

        {/* ── Navigation ───────────────────────────────────────── */}
        <nav className="flex-1 px-3 pt-3">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter(isVisible);
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.label} className="mb-5">
                {/* Group label */}
                <p className="mb-1 px-2 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">
                  {group.label}
                </p>

                {/* Items */}
                <div className="flex flex-col gap-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/dashboard' && pathname?.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleLinkClick}
                        aria-current={isActive ? 'page' : undefined}
                        className={[
                          'relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-150',
                          'focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-1',
                          isActive
                            ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                            : 'text-[#344568] font-medium hover:bg-[#F8FAFC] hover:text-[#101B3D]',
                        ].join(' ')}
                      >
                        {/* Active indicator bar */}
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-1/4 h-1/2 w-[3px] rounded-r-full bg-[#2563EB]"
                          />
                        )}

                        {/* Icon container */}
                        <span
                          className={[
                            'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
                            isActive
                              ? 'bg-[#DBEAFE] text-[#2563EB]'
                              : 'bg-transparent text-[#64748B]',
                          ].join(' ')}
                          aria-hidden="true"
                        >
                          <Icon
                            size={15}
                            strokeWidth={isActive ? 2.5 : 2}
                          />
                        </span>

                        <span className="flex-1">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* ── Learning encouragement card ───────────────────────── */}
        <div className="px-3 pb-3">
          <div className="flex gap-2.5 rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-3.5">
            <Sparkles size={15} className="mt-0.5 flex-shrink-0 text-[#2563EB]" aria-hidden="true" />
            <div>
              <p className="text-[0.78rem] font-semibold text-[#101B3D]">Keep learning together</p>
              <p className="mt-0.5 text-[0.7rem] leading-[1.45] text-[#64748B]">
                Ask, share, and grow with your peers.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-[#E5EAF2]" />

        {/* ── User profile ─────────────────────────────────────── */}
        <div className="p-3">
          <button
            aria-label="Open user menu"
            className="flex w-full items-center gap-2.5 rounded-xl border border-transparent p-2 text-left transition-all duration-150 hover:border-[#E5EAF2] hover:bg-[#F8FAFC] focus-visible:outline-2 focus-visible:outline-[#2563EB]"
          >
            {/* Avatar */}
            <div
              aria-hidden="true"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-[0.7rem] font-bold tracking-wide text-white"
            >
              SU
            </div>

            {/* User info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.825rem] font-semibold text-[#101B3D]">Student User</p>
              <p className="text-[0.7rem] text-[#64748B]">Student</p>
            </div>

            <ChevronDown size={14} className="flex-shrink-0 text-[#94A3B8]" aria-hidden="true" />
          </button>
        </div>
      </aside>
    </>
  );
}
