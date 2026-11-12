'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bookmark } from 'lucide-react';
import KnowledgeList from '@/components/knowledge/KnowledgeList';

export default function KnowledgeBookmarksPage() {
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, limit: 12, offset: 0, hasMore: false });
  const [offset, setOffset] = useState(0);
  const limit = 12;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookmarks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/knowledge/bookmarks?limit=${limit}&offset=${offset}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load saved articles');
      }
      setResources(data.resources || []);
      setPagination(data.pagination || { total: 0, limit, offset: 0, hasMore: false });
    } catch (err) {
      setError(err.message || 'Error loading saved articles');
    } finally {
      setIsLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href="/knowledge"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Knowledge Hub
        </Link>
        <span className="text-xs text-[#94A3B8]">Personal Library</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
          <Bookmark size={20} className="fill-[#2563EB]" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#101B3D]">Saved Academic Articles</h1>
          <p className="mt-0.5 text-xs text-[#64748B]">
            All the guides and reference notes you have bookmarked for quick revision.
          </p>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <KnowledgeList
        resources={resources}
        isLoading={isLoading}
        error={error}
        onRetry={fetchBookmarks}
        pagination={pagination}
        onPageChange={(newOffset) => setOffset(newOffset)}
        emptyTitle="No Saved Articles"
        emptyDescription="When browsing the Knowledge Hub, click the bookmark icon on any card to save it here."
        onBookmarkChange={(resourceId, isBookmarked) => {
          if (!isBookmarked) {
            setResources((prev) => prev.filter((r) => r.id !== resourceId));
          }
        }}
      />
    </div>
  );
}

