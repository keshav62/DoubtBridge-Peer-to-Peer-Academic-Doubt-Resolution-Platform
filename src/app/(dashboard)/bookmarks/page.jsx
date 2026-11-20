'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Bookmark, Trash2, Search, HelpCircle, BookOpen, AlertCircle,
  Loader2, ExternalLink, ChevronLeft, ChevronRight, FileText,
} from 'lucide-react';

const STATUS_COLORS = {
  OPEN: 'text-[#2563EB] bg-[#EFF6FF]',
  ASSIGNED: 'text-[#7C3AED] bg-[#F5F3FF]',
  CLAIMED: 'text-[#D97706] bg-[#FFFBEB]',
  ANSWERED: 'text-[#059669] bg-[#ECFDF5]',
  RESOLVED: 'text-[#10B981] bg-[#D1FAE5]',
  CLOSED: 'text-[#6B7280] bg-[#F3F4F6]',
  APPROVED: 'text-[#059669] bg-[#ECFDF5]',
  PENDING: 'text-[#D97706] bg-[#FFFBEB]',
  REJECTED: 'text-[#DC2626] bg-[#FEF2F2]',
};

function BookmarkCard({ bookmark, onRemove, removing }) {
  const isDoubt = !!bookmark.doubt;
  const item = bookmark.doubt || bookmark.resource;

  if (!item) return null;

  return (
    <div className="group rounded-xl border border-[#E5EAF2] bg-white p-4 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Type badge */}
      <div className="flex items-center justify-between">
        <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${isDoubt ? 'text-[#2563EB] bg-[#EFF6FF]' : 'text-[#06B6D4] bg-[#ECFEFF]'}`}>
          {isDoubt ? <HelpCircle size={10} /> : <FileText size={10} />}
          {isDoubt ? 'Doubt' : 'Resource'}
        </span>
        {item.status && (
          <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${STATUS_COLORS[item.status] || 'text-[#64748B] bg-[#F1F5F9]'}`}>
            {item.status}
          </span>
        )}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-[#101B3D] leading-snug line-clamp-2">{item.title}</h3>
        {item.description && (
          <p className="mt-1 text-xs text-[#64748B] line-clamp-2">{item.description}</p>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 text-[10px] text-[#94A3B8] flex-wrap">
        <span className="rounded-full border border-[#E5EAF2] px-2 py-0.5">{item.subject}</span>
        {item.topic && <span className="rounded-full border border-[#E5EAF2] px-2 py-0.5">{item.topic}</span>}
        {isDoubt && item._count?.answers !== undefined && (
          <span>{item._count.answers} answer{item._count.answers !== 1 ? 's' : ''}</span>
        )}
        {!isDoubt && item.views !== undefined && (
          <span>{item.views} views</span>
        )}
        <span className="ml-auto">{new Date(bookmark.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-[#F1F5F9]">
        <Link
          href={isDoubt ? `/doubts/${item.id}` : `/knowledge/${item.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
        >
          <ExternalLink size={12} /> View
        </Link>
        <button
          onClick={() => onRemove(bookmark.id)}
          disabled={removing}
          className="ml-auto flex items-center gap-1 text-xs text-[#EF4444] hover:text-[#B91C1C] transition-colors disabled:opacity-50"
        >
          {removing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
          Remove
        </button>
      </div>
    </div>
  );
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [removingId, setRemovingId] = useState(null);
  const searchTimeout = useRef(null);

  const load = useCallback(async (currentType, currentSearch, currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        type: currentType,
        search: currentSearch,
        page: String(currentPage),
        limit: '12',
      });
      const res = await fetch(`/api/bookmarks?${params}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load bookmarks');
      setBookmarks(json.bookmarks);
      setPagination(json.pagination);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(type, search, page);
  }, [load, type, page]); // search is debounced below

  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      load(type, val, 1);
    }, 400);
  };

  const handleTypeChange = (t) => {
    setType(t);
    setPage(1);
  };

  const handleRemove = async (id) => {
    setRemovingId(id);
    try {
      const res = await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to remove');
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch (e) {
      alert(e.message);
    } finally {
      setRemovingId(null);
    }
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'doubts', label: 'Doubts' },
    { key: 'resources', label: 'Resources' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#101B3D] flex items-center gap-2">
            <Bookmark size={22} className="text-[#2563EB]" /> Bookmarks
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">Your saved doubts and knowledge resources.</p>
        </div>
        <span className="text-sm font-semibold text-[#2563EB] bg-[#EFF6FF] rounded-full px-3 py-1 self-start sm:self-auto">
          {pagination.total} saved
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-[#F1F5F9] self-start">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTypeChange(t.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${type === t.key ? 'bg-white text-[#2563EB] shadow-sm' : 'text-[#64748B] hover:text-[#101B3D]'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search bookmarks…"
            className="w-full rounded-xl border border-[#E5EAF2] bg-white pl-8 pr-3 py-2 text-sm text-[#101B3D] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-[#64748B]">
          <Loader2 size={24} className="animate-spin text-[#2563EB]" />
          <span className="text-sm">Loading bookmarks…</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <AlertCircle size={32} className="text-red-400" />
          <p className="text-sm text-[#64748B]">{error}</p>
          <button onClick={() => load(type, search, page)} className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors">
            Retry
          </button>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Bookmark size={40} className="text-[#CBD5E1]" />
          <p className="font-semibold text-[#101B3D]">No bookmarks found</p>
          <p className="text-sm text-[#64748B]">
            {search ? 'Try a different search term.' : 'Save doubts or resources to find them here.'}
          </p>
          {!search && (
            <div className="flex gap-3 mt-2">
              <Link href="/doubts" className="rounded-xl border border-[#E5EAF2] px-4 py-2 text-sm font-semibold text-[#2563EB] hover:bg-[#EFF6FF] transition-colors">
                Browse Doubts
              </Link>
              <Link href="/knowledge" className="rounded-xl border border-[#E5EAF2] px-4 py-2 text-sm font-semibold text-[#06B6D4] hover:bg-[#ECFEFF] transition-colors">
                Browse Resources
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks.map((b) => (
              <BookmarkCard key={b.id} bookmark={b} onRemove={handleRemove} removing={removingId === b.id} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-xl border border-[#E5EAF2] px-3 py-1.5 text-xs font-semibold text-[#344568] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-xs text-[#64748B] font-medium">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="flex items-center gap-1 rounded-xl border border-[#E5EAF2] px-3 py-1.5 text-xs font-semibold text-[#344568] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
