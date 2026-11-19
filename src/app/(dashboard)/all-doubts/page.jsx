'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, ChevronLeft, ChevronRight, BookOpen, RefreshCw, AlertCircle } from 'lucide-react';
import DoubtFilters from '@/components/doubts/DoubtFilters';
import DoubtList from '@/components/doubts/DoubtList';

const PAGE_SIZE = 10;

export default function AllDoubtsPage() {
  const [doubts, setDoubts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [subject, setSubject] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);

  // Fetch user role to control Ask a Doubt button visibility
  useEffect(() => {
    async function fetchUserRole() {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        if (data.success) {
          setUserRole(data.user?.role);
        }
      } catch (err) {
        console.error('Failed to fetch user role:', err);
      }
    }
    fetchUserRole();
  }, []);

  // Fetch all platform doubts
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
  }, [page, search, status, subject, sort]);

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

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

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setSubject('');
    setSort('');
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101B3D]">
            All Doubts
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Browse all academic doubts submitted by students across the platform.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchDoubts}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2 text-xs font-semibold text-[#344568] hover:border-[#BFDBFE] hover:bg-[#F8FAFC] transition-all disabled:opacity-50 shadow-xs"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          {userRole !== 'HELPER' && (
            <Link
              href="/doubts/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 hover:bg-[#1D4ED8] transition-all"
            >
              <Plus size={16} />
              Ask a Doubt
            </Link>
          )}
        </div>
      </div>

      {/* ── Error Banner ─────────────────────────────────────── */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchDoubts}
            className="font-bold underline hover:no-underline ml-4"
          >
            Try Again
          </button>
        </div>
      )}

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

      {/* ── Doubts List ─────────────────────────────────────── */}
      <DoubtList
        doubts={doubts}
        loading={loading}
        error={error}
        onRetry={fetchDoubts}
        emptyTitle="No doubts found"
        emptyDescription="No doubts match your current filters. Try adjusting your search or filters."
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
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
