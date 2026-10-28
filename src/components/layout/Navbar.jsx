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
      className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[#E5EAF2] bg-white/95 px-4 md:px-6 backdrop-blur-md"
    >
      {/* ── Left: hamburger + search ────────────────────────── */}
      <div className="flex min-w-0 flex-1 items-center gap-3">

        {/* Mobile hamburger — hidden ≥md */}
        <button
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          aria-haspopup="true"
          className="flex md:hidden items-center justify-center h-9 w-9 flex-shrink-0 rounded-lg border border-[#E5EAF2] text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#101B3D] focus-visible:outline-2 focus-visible:outline-[#2563EB]"
        >
          <Menu size={18} />
        </button>

        {/* Search bar */}
        <div className="relative flex max-w-[460px] flex-1 items-center">
          <Search
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 text-[#94A3B8]"
          />

          <input
            id="navbar-search"
            type="search"
            role="searchbox"
            aria-label="Search doubts, topics, or courses"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doubts, topics, or courses..."
            className="h-[38px] w-full rounded-xl border border-[#E5EAF2] bg-[#F8FAFC] pl-9 pr-[4.5rem] text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none transition-all focus:border-[#2563EB]/40 focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10 [&::-webkit-search-cancel-button]:hidden"
          />

          {/* Ctrl K hint — hidden on mobile */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 hidden items-center gap-0.5 sm:flex"
          >
            <kbd className="inline-flex items-center rounded px-1.5 py-0.5 text-[0.6rem] leading-none border border-[#E5EAF2] bg-white text-[#94A3B8]">
              Ctrl
            </kbd>
            <kbd className="inline-flex items-center rounded px-1.5 py-0.5 text-[0.6rem] leading-none border border-[#E5EAF2] bg-white text-[#94A3B8]">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* ── Right: notifications + user ─────────────────────── */}
      <div className="flex flex-shrink-0 items-center gap-2">

        {/* Bell */}
        <button
          aria-label="View notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-[#64748B] transition-colors hover:border-[#E5EAF2] hover:bg-[#F8FAFC] hover:text-[#2563EB] focus-visible:outline-2 focus-visible:outline-[#2563EB]"
        >
          <Bell size={18} />
        </button>

        {/* Vertical separator */}
        <div aria-hidden="true" className="mx-0.5 h-[22px] w-px bg-[#E5EAF2]" />

        {/* Avatar + dropdown */}
        <button
          aria-label="Open user menu"
          aria-haspopup="true"
          className="flex items-center gap-2 rounded-xl border border-transparent py-1 pl-1 pr-2 transition-colors hover:border-[#E5EAF2] hover:bg-[#F8FAFC] focus-visible:outline-2 focus-visible:outline-[#2563EB]"
        >
          <div
            aria-hidden="true"
            className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-[0.68rem] font-bold tracking-wide text-white"
          >
            SU
          </div>

          {/* Name + role hidden on small screens */}
          <div className="hidden text-left sm:block">
            <p className="whitespace-nowrap text-[0.8rem] font-semibold leading-tight text-[#101B3D]">
              Student User
            </p>
            <p className="text-[0.68rem] leading-tight text-[#64748B]">Student</p>
          </div>

          <ChevronDown
            size={13}
            className="hidden flex-shrink-0 text-[#94A3B8] sm:block"
            aria-hidden="true"
          />
        </button>
      </div>
    </header>
  );
}
