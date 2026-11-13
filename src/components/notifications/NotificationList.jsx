'use client';

import { Bell, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import NotificationItem from './NotificationItem';

export default function NotificationList({
  notifications = [],
  isLoading = false,
  error = null,
  onRetry,
  pagination = null,
  onPageChange,
  onMarkRead,
  onDelete,
  emptyTitle = 'No notifications yet',
  emptyDescription = 'When someone answers your doubt, reviews your submission, or assigns a helper, you will be notified here.',
}) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#E5EAF2] bg-white divide-y divide-[#F1F5F9] overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3 p-4 sm:p-5 animate-pulse">
            <div className="h-10 w-10 bg-slate-100 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-slate-100 rounded" />
              <div className="h-3.5 w-full bg-slate-100 rounded" />
              <div className="h-3 w-20 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center my-4">
        <AlertCircle size={24} className="mb-2 text-red-600" />
        <h3 className="text-sm font-bold text-red-900">Failed to load notifications</h3>
        <p className="mt-1 text-xs text-red-700">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-red-700 transition-colors"
          >
            Retry Request
          </button>
        )}
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#BFDBFE] bg-[#F8FAFC] py-16 px-6 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
          <Bell size={22} />
        </div>
        <h3 className="text-base font-bold text-[#101B3D]">{emptyTitle}</h3>
        <p className="mt-1 text-xs text-[#64748B] max-w-sm leading-relaxed">
          {emptyDescription}
        </p>
      </div>
    );
  }

  const { total = 0, page = 1, limit = 10, totalPages = 1 } = pagination || {};

  return (
    <div className="space-y-4">
      {/* ── Notification Items Container ───────────────────────── */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white divide-y divide-[#F1F5F9] shadow-2xs overflow-hidden">
        {notifications.map((item) => (
          <NotificationItem
            key={item.id}
            notification={item}
            onMarkRead={onMarkRead}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* ── Pagination ─────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#E5EAF2] pt-3 text-xs">
          <p className="text-[#64748B]">
            Page <span className="font-semibold text-[#101B3D]">{page}</span> of{' '}
            <span className="font-semibold text-[#101B3D]">{totalPages}</span> ({total} total)
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAF2] bg-white px-3 py-1.5 text-xs font-medium text-[#344568] hover:border-[#BFDBFE] hover:text-[#2563EB] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft size={13} /> Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAF2] bg-white px-3 py-1.5 text-xs font-medium text-[#344568] hover:border-[#BFDBFE] hover:text-[#2563EB] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
