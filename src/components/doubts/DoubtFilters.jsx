'use client';

import { useState, useEffect } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'OPEN' },
  { label: 'Claimed', value: 'CLAIMED' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'Answered', value: 'ANSWERED' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
];

const SUBJECT_OPTIONS = [
  'All Subjects',
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Algorithms',
  'Calculus',
];

const SORT_OPTIONS = [
  { label: 'Newest first', value: '' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'Highest urgency', value: 'urgency' },
];

/**
 * DoubtFilters — search input, status pills, subject filter, and sort selector.
 */
export default function DoubtFilters({
  search = '',
  onSearchChange,
  status = '',
  onStatusChange,
  subject = '',
  onSubjectChange,
  sort = '',
  onSortChange,
  onReset,
}) {
  const [localSearch, setLocalSearch] = useState(search);

  // Sync internal state if external search prop changes
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [localSearch, search, onSearchChange]);

  const hasActiveFilters = Boolean(search || status || subject || sort);

  return (
    <div className="space-y-4">
      {/* Top row: Search input + Subject & Sort dropdowns */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by title, description, or tags..."
            className="w-full rounded-xl border border-[#E5EAF2] bg-white py-2.5 pl-10 pr-9 text-sm text-[#101B3D] placeholder-[#64748B] transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#101B3D] p-0.5 rounded-full"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters and Sorting controls */}
        <div className="flex items-center gap-2">
          {/* Subject Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              aria-label="Filter by subject"
              className="w-full sm:w-auto appearance-none rounded-xl border border-[#E5EAF2] bg-white py-2.5 pl-3.5 pr-8 text-sm font-medium text-[#101B3D] transition-colors hover:border-[#BFDBFE] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 cursor-pointer"
            >
              <option value="">All Subjects</option>
              {SUBJECT_OPTIONS.filter((s) => s !== 'All Subjects').map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sort doubts"
              className="w-full sm:w-auto appearance-none rounded-xl border border-[#E5EAF2] bg-white py-2.5 pl-3.5 pr-8 text-sm font-medium text-[#101B3D] transition-colors hover:border-[#BFDBFE] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100/60 transition-colors whitespace-nowrap"
            >
              <X size={13} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[#64748B] font-medium flex items-center gap-1 mr-1.5 shrink-0">
          <SlidersHorizontal size={13} />
          Status:
        </span>
        {STATUS_OPTIONS.map((item) => {
          const isActive = status === item.value;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onStatusChange(item.value)}
              className={`rounded-full px-3.5 py-1.5 font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
                  : 'bg-white border border-[#E5EAF2] text-[#64748B] hover:border-[#BFDBFE] hover:text-[#101B3D]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

