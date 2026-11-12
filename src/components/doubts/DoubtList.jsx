'use client';

import Link from 'next/link';
import { Plus, HelpCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import DoubtCard from './DoubtCard';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';

/**
 * DoubtSkeleton — Shimmer placeholder card displayed during data loading.
 */
function DoubtSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Pill placeholders */}
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 rounded-full bg-slate-200" />
            <div className="h-5 w-24 rounded-full bg-slate-200" />
            <div className="h-5 w-20 rounded-full bg-slate-100" />
          </div>
          {/* Title line */}
          <div className="h-5 w-3/4 rounded bg-slate-200" />
          {/* Description line */}
          <div className="h-4 w-5/6 rounded bg-slate-100" />
          {/* Metadata */}
          <div className="flex items-center gap-3 pt-1">
            <div className="h-3.5 w-20 rounded bg-slate-100" />
            <div className="h-3.5 w-16 rounded bg-slate-100" />
            <div className="h-3.5 w-12 rounded bg-slate-100" />
          </div>
        </div>
        <div className="hidden sm:block h-8 w-24 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

/**
 * DoubtList — handles the rendering states (loading skeleton, error, empty, list).
 */
export default function DoubtList({
  doubts = [],
  loading = false,
  error = null,
  onRetry,
}) {
  // 1. Loading State
  if (loading) {
    return (
      <div className="space-y-3.5" aria-label="Loading doubts">
        <DoubtSkeleton />
        <DoubtSkeleton />
        <DoubtSkeleton />
        <DoubtSkeleton />
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center" role="alert">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-base font-semibold text-[#101B3D]">Unable to load doubts</h3>
        <p className="mt-1 text-sm text-[#64748B] max-w-md mx-auto">{error}</p>
        {onRetry && (
          <div className="mt-5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5"
            >
              <RefreshCw size={14} />
              Try Again
            </Button>
          </div>
        )}
      </div>
    );
  }

  // 3. Empty State
  if (!doubts || doubts.length === 0) {
    return (
      <EmptyState
        icon={<HelpCircle size={30} />}
        title="No doubts found"
        description="No doubts found. Try changing your filters or submit a new doubt."
        action={
          <Link
            href="/doubts/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors shadow-sm"
          >
            <Plus size={16} />
            Ask a Doubt
          </Link>
        }
      />
    );
  }

  // 4. Data List State
  return (
    <div className="space-y-3.5">
      {doubts.map((doubt) => (
        <DoubtCard key={doubt.id} doubt={doubt} />
      ))}
    </div>
  );
}

