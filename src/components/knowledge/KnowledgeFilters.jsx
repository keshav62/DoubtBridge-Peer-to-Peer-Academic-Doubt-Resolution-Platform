'use client';

import { ArrowUpDown, RotateCcw, Filter } from 'lucide-react';

export default function KnowledgeFilters({
  subjects = [],
  selectedSubject = 'All',
  onSelectSubject,
  selectedSort = 'newest',
  onSelectSort,
  onReset,
  hasActiveFilters = false,
}) {
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Alphabetical' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* ── Subject Pills ────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectSubject('All')}
          className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
            selectedSubject === 'All'
              ? 'border border-[#2563EB] bg-[#2563EB] text-white shadow-2xs'
              : 'border border-[#E5EAF2] bg-white text-[#344568] hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#2563EB]'
          }`}
        >
          All Subjects
        </button>

        {subjects.map((s) => {
          const name = typeof s === 'string' ? s : s.subject;
          const count = typeof s === 'object' && s.count !== undefined ? s.count : null;
          const isSelected = selectedSubject.toLowerCase() === name.toLowerCase();

          return (
            <button
              key={name}
              type="button"
              onClick={() => onSelectSubject(name)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isSelected
                  ? 'border border-[#2563EB] bg-[#2563EB] text-white shadow-2xs'
                  : 'border border-[#E5EAF2] bg-white text-[#344568] hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#2563EB]'
              }`}
            >
              <span>{name}</span>
              {count !== null && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[0.65rem] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#64748B]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Sort & Reset Bar ──────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ArrowUpDown size={13} className="text-[#94A3B8]" />
          <span className="text-[#64748B] font-medium">Sort by:</span>
          <select
            value={selectedSort}
            onChange={(e) => onSelectSort(e.target.value)}
            className="h-8 rounded-lg border border-[#E5EAF2] bg-white px-2.5 text-xs font-medium text-[#101B3D] outline-none focus:border-[#2563EB]/40 focus:ring-1 focus:ring-[#2563EB]/10 transition-all cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAF2] bg-white px-2.5 py-1 text-xs font-medium text-[#64748B] hover:border-[#BFDBFE] hover:text-[#2563EB] transition-colors"
          >
            <RotateCcw size={12} />
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}

