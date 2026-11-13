'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, RefreshCw, CheckCheck } from 'lucide-react';
import NotificationFilters from '@/components/notifications/NotificationFilters';
import NotificationList from '@/components/notifications/NotificationList';

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'READ'
  const [selectedType, setSelectedType] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit, totalPages: 1 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));

      if (activeFilter === 'UNREAD') params.set('read', 'false');
      if (activeFilter === 'READ') params.set('read', 'true');
      if (selectedType) params.set('type', selectedType);

      const res = await fetch(`/api/notifications?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load notifications');
      }

      setNotifications(data.notifications || []);
      setPagination(data.pagination || { total: 0, page: 1, limit, totalPages: 1 });
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(err.message || 'Error loading notifications');
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, selectedType, page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (notificationId) => {
    // Optimistic local update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' });
    } catch {
      // Non-blocking
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    // Optimistic local update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH' });
    } catch {
      // Non-blocking
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDelete = async (notificationId) => {
    // Optimistic remove
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));

    try {
      await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' });
    } catch {
      // Non-blocking
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
            <Bell size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#101B3D]">
                Notifications & Activity
              </h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Real-time updates regarding answers, question status, helper assignments, and moderation.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchNotifications}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2 text-xs font-semibold text-[#64748B] hover:border-[#BFDBFE] hover:text-[#2563EB] shadow-2xs self-start sm:self-auto transition-colors"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Filter Bar ────────────────────────────────────────────── */}
      <NotificationFilters
        activeFilter={activeFilter}
        onFilterChange={(filter) => {
          setActiveFilter(filter);
          setPage(1);
        }}
        selectedType={selectedType}
        onTypeChange={(type) => {
          setSelectedType(type);
          setPage(1);
        }}
        unreadCount={unreadCount}
        onMarkAllRead={handleMarkAllRead}
        isMarkingAll={isMarkingAll}
      />

      {/* ── Notifications List ────────────────────────────────────── */}
      <NotificationList
        notifications={notifications}
        isLoading={isLoading}
        error={error}
        onRetry={fetchNotifications}
        pagination={pagination}
        onPageChange={(newPage) => setPage(newPage)}
        onMarkRead={handleMarkRead}
        onDelete={handleDelete}
        emptyTitle={
          activeFilter === 'UNREAD'
            ? 'No unread notifications'
            : activeFilter === 'READ'
            ? 'No read notifications'
            : 'No notifications found'
        }
        emptyDescription={
          activeFilter === 'UNREAD'
            ? 'You have addressed all your unread notifications! Check back later.'
            : 'You will receive notifications here as students and helpers interact with your content.'
        }
      />
    </div>
  );
}

