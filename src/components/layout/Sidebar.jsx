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
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ── Sidebar panel ────────────────────────────────────── */}
      <aside
        role="navigation"
        aria-label="Main navigation"
        data-open={isOpen ? 'true' : 'false'}
        className={[
          // Base
          'fixed top-0 left-0 z-50 h-screen w-[252px] flex flex-col',
          'bg-[#111827] border-r border-white/[0.08] overflow-y-auto',
          'transition-transform duration-250 ease-in-out',
          // Mobile: slide in/out
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible, in-flow (override fixed)
          'md:relative md:translate-x-0 md:flex-shrink-0',
        ].join(' ')}
      >
        {/* ── Branding ─────────────────────────────────────────── */}
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center justify-between">
            {/* Logo + wordmark */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(99,102,241,0.4)]">
                <BookOpen size={17} color="#fff" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[1rem] font-bold tracking-tight text-gray-50 leading-none">
                  DoubtBridge
                </p>
                <p className="mt-0.5 text-[0.625rem] tracking-widest text-gray-500">
                  Learn · Ask · Solve
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              aria-label="Close navigation menu"
              className="flex md:hidden items-center justify-center rounded-md p-1 text-gray-400 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-white/[0.08]" />

        {/* ── Navigation ───────────────────────────────────────── */}
        <nav className="flex-1 px-3 pt-3">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter(isVisible);
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.label} className="mb-5">
                {/* Group label */}
                <p className="mb-1 px-2 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-gray-600">
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
                          'relative flex items-center gap-2.5 rounded-lg px-2.5 py-[0.55rem] text-sm transition-all duration-150',
                          'focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-1',
                          isActive
                            ? 'bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20'
                            : 'text-gray-400 font-medium border border-transparent hover:bg-white/[0.04] hover:text-gray-100',
                        ].join(' ')}
                      >
                        {/* Active indicator bar */}
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-1/4 h-1/2 w-[3px] rounded-r-sm bg-indigo-500"
                          />
                        )}

                        <Icon
                          size={16}
                          strokeWidth={isActive ? 2.5 : 2}
                          className={isActive ? 'text-indigo-400' : 'text-gray-500'}
                          aria-hidden="true"
                        />
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
          <div className="flex gap-2 rounded-[10px] border border-indigo-500/25 bg-gradient-to-br from-indigo-500/15 to-cyan-400/10 p-3.5">
            <Sparkles size={15} className="mt-0.5 flex-shrink-0 text-indigo-400" aria-hidden="true" />
            <div>
              <p className="text-[0.78rem] font-semibold text-gray-100">Keep learning together</p>
              <p className="mt-0.5 text-[0.7rem] leading-[1.45] text-gray-500">
                Ask, share, and grow with your peers.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-white/[0.08]" />

        {/* ── User profile ─────────────────────────────────────── */}
        <div className="p-3">
          <button
            aria-label="Open user menu"
            className="flex w-full items-center gap-2.5 rounded-lg border border-transparent p-2 text-left transition-all duration-150 hover:border-white/[0.08] hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-indigo-500"
          >
            {/* Avatar */}
            <div
              aria-hidden="true"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-[0.72rem] font-bold tracking-wide text-white"
            >
              SU
            </div>

            {/* User info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.825rem] font-semibold text-gray-100">Student User</p>
              <p className="text-[0.7rem] text-gray-500">Student</p>
            </div>

            <ChevronDown size={14} className="flex-shrink-0 text-gray-500" aria-hidden="true" />
          </button>
        </div>
      </aside>
    </>
  );
}
