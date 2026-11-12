'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, ChevronLeft, ChevronRight, BookOpen, UserCheck } from 'lucide-react';
import DoubtFilters from '@/components/doubts/DoubtFilters';
import DoubtList from '@/components/doubts/DoubtList';

const PAGE_SIZE = 10;

export default function DoubtsListPage() {
  const [doubts, setDoubts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [subject, setSubject] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [viewScope, setViewScope] = useState('all'); // 'all' or 'mine'

  // Fetch doubts from backend API
  const fetchDoubts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      const offset = (page - 1) * PAGE_SIZE;

      params.set('limit', PAGE_SIZE.toString());
      params.set('offset', offset.toString());

      if (search.trim()) params.set('q', search.trim());
      if (status) params.set('status', status);
      if (subject) params.set('subject', subject);
      if (sort) params.set('sort', sort);
      if (viewScope === 'mine') params.set('mine', 'true');

      const response = await fetch(`/api/doubts?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch doubts');
      }

      setDoubts(data.doubts || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching doubts:', err);
      setError(err.message || 'Something went wrong while loading doubts.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, subject, sort, viewScope]);

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

  // Reset page to 1 when filters or scope change
  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
    setPage(1);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleSubjectChange = (newSubject) => {
    setSubject(newSubject);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
  };

  const handleScopeChange = (newScope) => {
    setViewScope(newScope);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setSubject('');
    setSort('');
    setPage(1);
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101B3D]">
            Academic Doubts
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Browse community questions, track doubt resolution, and connect with peer helpers.
          </p>
        </div>
        <Link
          href="/doubts/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 hover:bg-[#1D4ED8] transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          Ask a Doubt
        </Link>
      </div>

      {/* ── Feed Scope Tabs (All Community Doubts vs My Doubts) ── */}
      <div className="flex items-center gap-2 border-b border-[#E5EAF2] pb-3">
        <button
          type="button"
          onClick={() => handleScopeChange('all')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            viewScope === 'all'
              ? 'bg-[#EFF6FF] text-[#2563EB]'
              : 'text-[#64748B] hover:text-[#101B3D] hover:bg-slate-50'
          }`}
        >
          <BookOpen size={14} />
          All Doubts
        </button>
        <button
          type="button"
          onClick={() => handleScopeChange('mine')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            viewScope === 'mine'
              ? 'bg-[#EFF6FF] text-[#2563EB]'
              : 'text-[#64748B] hover:text-[#101B3D] hover:bg-slate-50'
          }`}
        >
          <UserCheck size={14} />
          My Doubts Only
        </button>
      </div>

      {/* ── Search & Filter Controls ─────────────────────────── */}
      <DoubtFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        subject={subject}
        onSubjectChange={handleSubjectChange}
        sort={sort}
        onSortChange={handleSortChange}
        onReset={handleResetFilters}
      />

      {/* ── Doubts List (Loading skeleton, error, empty, cards) ─ */}
      <DoubtList
        doubts={doubts}
        loading={loading}
        error={error}
        onRetry={fetchDoubts}
      />

      {/* ── Pagination Bar ───────────────────────────────────── */}
      {!loading && !error && total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E5EAF2]">
          <p className="text-xs text-[#64748B]">
            Showing <span className="font-medium text-[#101B3D]">{startItem}</span> to{' '}
            <span className="font-medium text-[#101B3D]">{endItem}</span> of{' '}
            <span className="font-medium text-[#101B3D]">{total}</span> doubts
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-[#E5EAF2] bg-white px-3 py-1.5 text-xs font-medium text-[#344568] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            <span className="text-xs font-semibold text-[#101B3D] px-2">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-[#E5EAF2] bg-white px-3 py-1.5 text-xs font-medium text-[#344568] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
