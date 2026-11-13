'use client';

import { CheckCheck, Filter } from 'lucide-react';

export default function NotificationFilters({
  activeFilter = 'ALL', // 'ALL' | 'UNREAD' | 'READ'
  onFilterChange,
  selectedType = '',
  onTypeChange,
  unreadCount = 0,
  onMarkAllRead,
  isMarkingAll = false,
}) {
  const types = [
    { value: '', label: 'All Event Types' },
    { value: 'ANSWER_SUBMITTED', label: 'Answers Submitted' },
    { value: 'DOUBT_RESOLVED', label: 'Solutions Accepted' },
    { value: 'MODERATION_DECISION', label: 'Moderation Reviews' },
    { value: 'DOUBT_CREATED', label: 'Assignments' },
    { value: 'SYSTEM', label: 'System Alerts' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E5EAF2] pb-3">
      {/* ── Status Tabs ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => onFilterChange('ALL')}
          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            activeFilter === 'ALL'
              ? 'bg-[#101B3D] text-white shadow-2xs'
              : 'border border-[#E5EAF2] bg-white text-[#64748B] hover:text-[#101B3D]'
          }`}
        >
          All
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('UNREAD')}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            activeFilter === 'UNREAD'
              ? 'bg-[#2563EB] text-white shadow-2xs'
              : 'border border-[#E5EAF2] bg-white text-[#64748B] hover:text-[#2563EB]'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span
              className={`rounded-full px-1.5 py-0.2 text-[0.62rem] font-extrabold ${
                activeFilter === 'UNREAD'
                  ? 'bg-white/20 text-white'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('READ')}
          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            activeFilter === 'READ'
              ? 'bg-[#101B3D] text-white shadow-2xs'
              : 'border border-[#E5EAF2] bg-white text-[#64748B] hover:text-[#101B3D]'
          }`}
        >
          Read
        </button>
      </div>

      {/* ── Type Selector + Mark All Read ───────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-[#94A3B8]" />
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="h-8 rounded-lg border border-[#E5EAF2] bg-white px-2.5 text-xs font-medium text-[#101B3D] outline-none focus:border-[#2563EB]/40 cursor-pointer"
          >
            {types.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {unreadCount > 0 && onMarkAllRead && (
          <button
            type="button"
            disabled={isMarkingAll}
            onClick={onMarkAllRead}
            className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAF2] bg-white px-2.5 py-1 text-xs font-semibold text-[#64748B] hover:border-[#BFDBFE] hover:text-[#2563EB] disabled:opacity-50 transition-colors"
          >
            <CheckCheck size={13} />
            <span>{isMarkingAll ? 'Marking...' : 'Mark all read'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
