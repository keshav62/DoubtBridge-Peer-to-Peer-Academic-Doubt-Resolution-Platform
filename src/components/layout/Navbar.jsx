'use client';

import { useState } from 'react';
import { Search, Bell, ChevronDown, Menu } from 'lucide-react';

/**
 * Navbar props:
 *   onMenuClick {function} — called when the mobile hamburger is pressed
 */
export default function Navbar({ onMenuClick }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/[0.08] bg-[#111827]/90 px-4 md:px-6 backdrop-blur-md"
    >
      {/* ── Left: hamburger + search ────────────────────────── */}
      <div className="flex min-w-0 flex-1 items-center gap-3">

        {/* Mobile hamburger — hidden ≥md */}
        <button
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          aria-haspopup="true"
          className="flex md:hidden items-center justify-center h-9 w-9 flex-shrink-0 rounded-lg border border-white/[0.08] text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-gray-100 focus-visible:outline-2 focus-visible:outline-indigo-500"
        >
          <Menu size={18} />
        </button>

        {/* Search bar */}
        <div className="relative flex max-w-[460px] flex-1 items-center">
          <Search
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 text-gray-500"
          />

          <input
            id="navbar-search"
            type="search"
            role="searchbox"
            aria-label="Search doubts, topics, or courses"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doubts, topics, or courses..."
            className="h-[38px] w-full rounded-lg border border-white/[0.08] bg-white/[0.04] pl-9 pr-[4.5rem] text-sm text-gray-100 placeholder-gray-600 outline-none transition-all focus:border-indigo-500/50 focus:bg-indigo-500/[0.06] focus:ring-2 focus:ring-indigo-500/[0.12] [&::-webkit-search-cancel-button]:hidden"
          />

          {/* Ctrl K hint — hidden on mobile */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 hidden items-center gap-0.5 sm:flex"
          >
            <kbd className="inline-flex items-center rounded px-1.5 py-0.5 text-[0.6rem] leading-none border border-white/[0.08] bg-white/[0.06] text-gray-500">
              Ctrl
            </kbd>
            <kbd className="inline-flex items-center rounded px-1.5 py-0.5 text-[0.6rem] leading-none border border-white/[0.08] bg-white/[0.06] text-gray-500">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* ── Right: notifications + user ─────────────────────── */}
      <div className="flex flex-shrink-0 items-center gap-2">

        {/* Bell */}
        <button
          aria-label="View notifications (3 unread)"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-colors hover:border-white/[0.08] hover:bg-white/[0.06] hover:text-gray-100 focus-visible:outline-2 focus-visible:outline-indigo-500"
        >
          <Bell size={18} />
          {/* Unread dot */}
          <span
            aria-hidden="true"
            className="absolute right-[7px] top-[7px] h-[7px] w-[7px] rounded-full border-[1.5px] border-[#111827] bg-indigo-500"
          />
        </button>

        {/* Vertical separator */}
        <div aria-hidden="true" className="mx-0.5 h-[22px] w-px bg-white/[0.08]" />

        {/* Avatar + dropdown */}
        <button
          aria-label="Open user menu"
          aria-haspopup="true"
          className="flex items-center gap-2 rounded-lg border border-transparent py-1 pl-1 pr-1.5 transition-colors hover:border-white/[0.08] hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-indigo-500"
        >
          <div
            aria-hidden="true"
            className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-[0.68rem] font-bold tracking-wide text-white"
          >
            SU
          </div>

          {/* Name + role hidden on small screens */}
          <div className="hidden text-left sm:block">
            <p className="whitespace-nowrap text-[0.8rem] font-semibold leading-tight text-gray-100">
              Student User
            </p>
            <p className="text-[0.68rem] leading-tight text-gray-500">Student</p>
          </div>

          <ChevronDown
            size={13}
            className="hidden flex-shrink-0 text-gray-500 sm:block"
            aria-hidden="true"
          />
        </button>
      </div>
    </header>
  );
}
