'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquare, Search, PlusCircle, HelpCircle, ChevronLeft,
  ChevronRight, Loader2, AlertCircle, Filter, ArrowUp, Clock,
  CheckCircle, BookOpen,
} from 'lucide-react';

const STATUS_BADGE = {
  OPEN:     { label: 'Open',     cls: 'text-[#2563EB] bg-[#EFF6FF]' },
  ASSIGNED: { label: 'Assigned', cls: 'text-[#7C3AED] bg-[#F5F3FF]' },
  CLAIMED:  { label: 'Claimed',  cls: 'text-[#D97706] bg-[#FFFBEB]' },
  ANSWERED: { label: 'Answered', cls: 'text-[#059669] bg-[#ECFDF5]' },
  RESOLVED: { label: 'Resolved', cls: 'text-[#10B981] bg-[#D1FAE5]' },
  CLOSED:   { label: 'Closed',   cls: 'text-[#6B7280] bg-[#F3F4F6]' },
};

const PRIORITY_BADGE = {
  LOW:    'text-[#6B7280] bg-[#F3F4F6]',
  MEDIUM: 'text-[#D97706] bg-[#FFFBEB]',
  HIGH:   'text-[#DC2626] bg-[#FEF2F2]',
  URGENT: 'text-[#9333EA] bg-[#FAF5FF]',
};

function DoubtCard({ doubt }) {
  const statusCfg = STATUS_BADGE[doubt.status] || { label: doubt.status, cls: 'text-[#64748B] bg-[#F1F5F9]' };
  const priCls = PRIORITY_BADGE[doubt.priority] || 'text-[#64748B] bg-[#F1F5F9]';
  const answerCount = doubt.answers?.length ?? doubt._count?.answers ?? 0;

  return (
    <Link href={`/doubts/${doubt.id}`} className="block group rounded-xl border border-[#E5EAF2] bg-white p-4 shadow-sm hover:shadow-md hover:border-[#BFDBFE] transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm text-[#101B3D] leading-snug group-hover:text-[#2563EB] transition-colors line-clamp-2 flex-1">
          {doubt.title}
        </h3>
        <span className={`flex-shrink-0 text-[10px] font-bold uppercase rounded-full px-2 py-0.5 ${statusCfg.cls}`}>
          {statusCfg.label}
        </span>
      </div>

      <p className="text-xs text-[#64748B] line-clamp-2 mb-3">
        {doubt.description}
      </p>

      <div className="flex items-center gap-2 flex-wrap text-[10px]">
        <span className="rounded-full border border-[#E5EAF2] px-2 py-0.5 text-[#64748B]">{doubt.subject}</span>
        {doubt.topic && <span className="rounded-full border border-[#E5EAF2] px-2 py-0.5 text-[#64748B]">{doubt.topic}</span>}
        <span className={`rounded-full px-2 py-0.5 font-semibold ${priCls}`}>{doubt.priority}</span>
      </div>

      <div className="mt-3 flex items-center gap-3 text-[10px] text-[#94A3B8] border-t border-[#F1F5F9] pt-2">
        <span className="flex items-center gap-1">
          <MessageSquare size={10} /> {answerCount} answer{answerCount !== 1 ? 's' : ''}
        </span>
        {doubt.student?.name && <span>by {doubt.student.name}</span>}
        <span className="ml-auto">{new Date(doubt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
      </div>
    </Link>
  );
}

export default function DiscussionPage() {
  const [doubts, setDoubts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [subject, setSubject] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const searchTimeout = useRef(null);

  const load = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const sp = new URLSearchParams();
      if (params.search) sp.set('q', params.search);
      if (params.status) sp.set('status', params.status);
      if (params.subject) sp.set('subject', params.subject);
      if (params.sort) sp.set('sort', params.sort);
      sp.set('limit', '12');
      sp.set('offset', String((params.page - 1) * 12));

      const res = await fetch(`/api/doubts?${sp}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load');
      setDoubts(json.doubts || []);

      const total = json.pagination?.total ?? json.total ?? 0;
      const fetchedLimit = 12;
      const offset = (params.page - 1) * fetchedLimit;
      setPagination({
        total,
        page: params.page,
        totalPages: Math.ceil(total / fetchedLimit),
        hasMore: offset + (json.doubts?.length || 0) < total,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const currentParams = { search, status, subject, sort, page };

  useEffect(() => {
    load(currentParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, subject, sort, page]);

  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      load({ search: val, status, subject, sort, page: 1 });
    }, 400);
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'OPEN', label: 'Open' },
    { value: 'ANSWERED', label: 'Answered' },
    { value: 'RESOLVED', label: 'Resolved' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'unanswered', label: 'Unanswered' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#101B3D] flex items-center gap-2">
            <MessageSquare size={22} className="text-[#2563EB]" /> Discussion
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">Community feed — browse, ask, and answer doubts together.</p>
        </div>
        <Link
          href="/doubts/new"
          className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors self-start sm:self-auto"
        >
          <PlusCircle size={16} /> Ask a Doubt
        </Link>
      </div>

      {/* Stats strip */}
      <div className="flex gap-4 text-xs text-[#64748B]">
        <span className="font-semibold text-[#2563EB]">{pagination.total}</span> total discussions
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search discussions…"
            className="w-full rounded-xl border border-[#E5EAF2] bg-white pl-8 pr-3 py-2 text-sm text-[#101B3D] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
          />
        </div>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl border border-[#E5EAF2] bg-white px-3 py-2 text-sm text-[#344568] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
        >
          {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="rounded-xl border border-[#E5EAF2] bg-white px-3 py-2 text-sm text-[#344568] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
        >
          {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-[#64748B]">
          <Loader2 size={24} className="animate-spin text-[#2563EB]" />
          <span className="text-sm">Loading discussions…</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <AlertCircle size={32} className="text-red-400" />
          <p className="text-sm text-[#64748B]">{error}</p>
          <button onClick={() => load(currentParams)} className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors">Retry</button>
        </div>
      ) : doubts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <MessageSquare size={40} className="text-[#CBD5E1]" />
          <p className="font-semibold text-[#101B3D]">No discussions found</p>
          <p className="text-sm text-[#64748B]">
            {search || status || subject ? 'Try adjusting your filters.' : 'Be the first to start a discussion!'}
          </p>
          <Link href="/doubts/new" className="mt-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors">
            Ask a Doubt
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doubts.map((d) => <DoubtCard key={d.id} doubt={d} />)}
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
              <span className="text-xs text-[#64748B] font-medium">Page {page} of {pagination.totalPages}</span>
              <button
                disabled={!pagination.hasMore || loading}
                onClick={() => setPage((p) => p + 1)}
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
