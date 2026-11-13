'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  LogOut,
  User,
  Settings,
  Shield,
  Loader2,
} from 'lucide-react';

function getRoleColor(role) {
  switch (role) {
    case 'ADMIN': return 'text-red-600';
    case 'MODERATOR': return 'text-purple-600';
    case 'HELPER': return 'text-emerald-600';
    default: return 'text-[#64748B]';
  }
}

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/**
 * UserMenu — displays the authenticated user's avatar, name, and role
 * with a dropdown for profile / logout actions.
 *
 * Props:
 *   user {object|null}  — the authenticated user (fetched server-side)
 */
export default function UserMenu({ user }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch {
        // ignore network errors — still redirect
      }
      router.push('/login');
      router.refresh();
    });
  };

  if (!user) {
    return (
      <a
        href="/login"
        className="rounded-full border border-[#E5EAF2] px-4 py-1.5 text-sm font-semibold text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
      >
        Sign in
      </a>
    );
  }

  const initials = getInitials(user.name);
  const roleLabel = user.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'User';
  const roleColor = getRoleColor(user.role);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open user menu"
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl border border-transparent py-1 pl-1 pr-2 transition-colors hover:border-[#E5EAF2] hover:bg-[#F8FAFC] focus-visible:outline-2 focus-visible:outline-[#2563EB]"
      >
        {/* Avatar */}
        <div
          aria-hidden="true"
          className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-[0.68rem] font-bold tracking-wide text-white"
        >
          {initials}
        </div>

        {/* Name + role */}
        <div className="hidden text-left sm:block">
          <p className="whitespace-nowrap text-[0.8rem] font-semibold leading-tight text-[#101B3D]">
            {user.name}
          </p>
          <p className={`text-[0.68rem] leading-tight font-medium ${roleColor}`}>
            {roleLabel}
          </p>
        </div>

        <ChevronDown
          size={13}
          className={`hidden flex-shrink-0 text-[#94A3B8] sm:block transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-[#E5EAF2] bg-white py-1.5 shadow-lg shadow-slate-200/60">
          {/* User info header */}
          <div className="border-b border-[#E5EAF2] px-4 py-3">
            <p className="text-sm font-semibold text-[#101B3D] truncate">{user.name}</p>
            <p className="text-xs text-[#64748B] truncate">{user.email}</p>
            {user.department && (
              <p className="mt-0.5 text-xs text-[#94A3B8] truncate">{user.department}</p>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            <a
              href="/dashboard"
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#344568] hover:bg-[#F8FAFC] transition-colors"
            >
              <User size={15} className="text-[#94A3B8]" />
              Dashboard
            </a>

            {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
              <a
                href="/moderation"
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#344568] hover:bg-[#F8FAFC] transition-colors"
              >
                <Shield size={15} className="text-[#94A3B8]" />
                Moderation
              </a>
            )}

            {user.role === 'ADMIN' && (
              <a
                href="/admin"
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#2563EB] font-semibold hover:bg-[#EFF6FF] transition-colors"
              >
                <Settings size={15} className="text-[#2563EB]" />
                Control Center
              </a>
            )}
          </div>

          <div className="border-t border-[#E5EAF2] py-1">
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <LogOut size={15} />
              )}
              {isPending ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

