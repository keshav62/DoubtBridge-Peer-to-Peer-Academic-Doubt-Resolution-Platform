'use client';

import Link from 'next/link';
import { CheckCheck, ExternalLink, Bell, ArrowRight } from 'lucide-react';
import NotificationItem from './NotificationItem';

export default function NotificationDropdown({
  notifications = [],
  unreadCount = 0,
  isLoading = false,
  onMarkRead,
  onMarkAllRead,
  onClose,
}) {
  return (
    <div
      role="menu"
      aria-label="Notifications flyout"
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-[#E5EAF2] bg-white shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* ── Dropdown Header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#F1F5F9] bg-[#F8FAFC] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#101B3D]">Notifications</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-100 px-1.5 py-0.2 text-[0.62rem] font-extrabold text-red-600">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && onMarkAllRead && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-[#2563EB] hover:underline"
          >
            <CheckCheck size={12} />
            Mark all read
          </button>
        )}
      </div>

      {/* ── Notification Items ────────────────────────────────────── */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[#F1F5F9] scrollbar-thin">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 bg-slate-100 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-3/4 bg-slate-100 rounded" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <Bell size={20} className="mx-auto mb-1.5 text-[#94A3B8]" />
            <p className="text-xs font-semibold text-[#101B3D]">No notifications</p>
            <p className="text-[0.7rem] text-[#94A3B8]">You are all caught up!</p>
          </div>
        ) : (
          notifications.slice(0, 5).map((item) => (
            <NotificationItem
              key={item.id}
              notification={item}
              compact={true}
              onMarkRead={onMarkRead}
              onItemClick={() => {
                if (onClose) onClose();
              }}
            />
          ))
        )}
      </div>

      {/* ── Dropdown Footer ───────────────────────────────────────── */}
      <div className="border-t border-[#F1F5F9] bg-[#F8FAFC] px-4 py-2.5 text-center">
        <Link
          href="/notifications"
          onClick={() => {
            if (onClose) onClose();
          }}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
        >
          View all notifications <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
