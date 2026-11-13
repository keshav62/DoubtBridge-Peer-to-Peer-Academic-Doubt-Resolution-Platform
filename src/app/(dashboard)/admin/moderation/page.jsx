'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, ChevronLeft, RefreshCw, ExternalLink } from 'lucide-react';
import AdminModerationQueue from '@/components/admin/AdminModerationQueue';

export default function AdminModerationPage() {
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQueue = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/moderation');
      const json = await res.json();
      if (json.success) {
        setQueue(json);
      }
    } catch (err) {
      console.error('Failed to fetch moderation queue:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-[#101B3D]">
              Platform Moderation Hub
            </h1>
            {queue?.counts && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                {queue.counts.total} Awaiting Decision
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Unified administrative queue for peer answer moderation, academic knowledge guides, and community reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/moderation"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2 text-xs font-semibold text-[#101B3D] hover:bg-[#F8FAFC] transition-colors"
          >
            Open Moderator Queue <ExternalLink size={13} />
          </Link>
          <button
            type="button"
            onClick={() => fetchQueue(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Moderation Queue Tabs & Listings */}
      <AdminModerationQueue queue={queue} loading={loading} />
    </div>
  );
}
