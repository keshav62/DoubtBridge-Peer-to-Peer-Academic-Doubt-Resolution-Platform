'use client';

import { Search, ChevronDown, RotateCcw } from 'lucide-react';

export default function AdminUserFilters({
  search,
  setSearch,
  role,
  setRole,
  status,
  setStatus,
  sort,
  setSort,
  onReset,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-[#E5EAF2] bg-white p-4 shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name, academic email, department..."
          className="h-10 w-full rounded-xl border border-[#E5EAF2] bg-[#F8FAFC] pl-9 pr-3.5 text-xs text-[#101B3D] placeholder-[#94A3B8] outline-none transition-all focus:border-[#2563EB]/50 focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10"
        />
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Role Filter */}
        <div className="relative">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-10 appearance-none rounded-xl border border-[#E5EAF2] bg-white pl-3 pr-8 text-xs font-semibold text-[#344568] outline-none transition-all focus:border-[#2563EB]/50 cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="HELPER">Peer Helpers</option>
            <option value="MODERATOR">Moderators</option>
            <option value="ADMIN">Administrators</option>
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 appearance-none rounded-xl border border-[#E5EAF2] bg-white pl-3 pr-8 text-xs font-semibold text-[#344568] outline-none transition-all focus:border-[#2563EB]/50 cursor-pointer"
          >
            <option value="">All Account Statuses</option>
            <option value="ACTIVE">Active Accounts</option>
            <option value="SUSPENDED">Suspended Accounts</option>
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        </div>

        {/* Sort Filter */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 appearance-none rounded-xl border border-[#E5EAF2] bg-white pl-3 pr-8 text-xs font-semibold text-[#344568] outline-none transition-all focus:border-[#2563EB]/50 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="reputation">Highest Reputation</option>
            <option value="name">Alphabetical</option>
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        </div>

        {/* Reset */}
        {(search || role || status || sort !== 'newest') && (
          <button
            type="button"
            onClick={onReset}
            title="Reset filters"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5EAF2] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#101B3D] transition-colors"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

