'use client';

import { BookOpen, AlertCircle, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import KnowledgeCard from './KnowledgeCard';

export default function KnowledgeList({
  resources = [],
  isLoading = false,
  error = null,
  onRetry,
  pagination = null,
  onPageChange,
  emptyTitle = 'No academic articles found',
  emptyDescription = 'Try adjusting your search terms or filters to discover relevant learning materials.',
  onBookmarkChange,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col rounded-2xl border border-[#E5EAF2] bg-white p-6 animate-pulse space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-slate-100 rounded-full" />
              <div className="h-6 w-12 bg-slate-100 rounded-xl" />
            </div>
            <div className="h-5 w-3/4 bg-slate-100 rounded-md" />
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-slate-100 rounded" />
              <div className="h-3.5 w-5/6 bg-slate-100 rounded" />
            </div>
            <div className="border-t border-slate-100 pt-3 mt-auto flex items-center justify-between">
              <div className="h-4 w-28 bg-slate-100 rounded" />
              <div className="h-4 w-16 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center my-6">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-base font-bold text-red-900">Failed to load articles</h3>
        <p className="mt-1 text-xs text-red-700 max-w-md">{error}</p>
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

  if (!resources || resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#BFDBFE] bg-[#F8FAFC] py-16 px-6 text-center my-4">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF]">
          <BookOpen size={26} className="text-[#2563EB]" />
        </div>
        <h3 className="text-base font-bold text-[#101B3D]">{emptyTitle}</h3>
        <p className="mt-1 text-xs text-[#64748B] max-w-md leading-relaxed">{emptyDescription}</p>
        <Link
          href="/knowledge/new"
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#1D4ED8] transition-colors"
        >
          <Plus size={14} />
          Submit a Resource
        </Link>
      </div>
    );
  }

  const { total = 0, limit = 12, offset = 0 } = pagination || {};
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* ── Resource Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((item) => (
          <KnowledgeCard
            key={item.id}
            resource={item}
            onBookmarkChange={(bookmarked) => {
              if (onBookmarkChange) onBookmarkChange(item.id, bookmarked);
            }}
          />
        ))}
      </div>

      {/* ── Pagination ───────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#E5EAF2] pt-4 text-xs">
          <p className="text-[#64748B]">
            Showing <span className="font-semibold text-[#101B3D]">{offset + 1}</span> to{' '}
            <span className="font-semibold text-[#101B3D]">
              {Math.min(offset + limit, total)}
            </span>{' '}
            of <span className="font-semibold text-[#101B3D]">{total}</span> articles
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(Math.max(0, offset - limit))}
              className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAF2] bg-white px-3 py-1.5 text-xs font-medium text-[#344568] hover:border-[#BFDBFE] hover:text-[#2563EB] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="text-[#64748B] font-medium px-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(offset + limit)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAF2] bg-white px-3 py-1.5 text-xs font-medium text-[#344568] hover:border-[#BFDBFE] hover:text-[#2563EB] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

