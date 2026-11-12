'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  HelpCircle,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { timeAgo } from '@/lib/utils';

export default function HelperAssignmentsList({
  assignments = [],
  isLoading = false,
  statusFilter = 'ALL',
  onStatusFilterChange,
  onCancelAssignment,
  isProcessingId = null,
}) {
  const [cancellingId, setCancellingId] = useState(null);

  const filtered = assignments.filter((a) => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  const activeCount = assignments.filter((a) => a.status === 'ACTIVE').length;
  const completedCount = assignments.filter((a) => a.status === 'COMPLETED').length;
  const cancelledCount = assignments.filter((a) => a.status === 'CANCELLED').length;

  return (
    <div className="space-y-5">
      {/* ── Tabs header ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5EAF2] pb-3">
        <div className="flex items-center gap-2">
          {[
            { key: 'ALL', label: 'All Assignments', count: assignments.length },
            { key: 'ACTIVE', label: 'Active', count: activeCount },
            { key: 'COMPLETED', label: 'Completed', count: completedCount },
            { key: 'CANCELLED', label: 'Cancelled', count: cancelledCount },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusFilterChange && onStatusFilterChange(tab.key)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                statusFilter === tab.key
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white text-[#64748B] hover:bg-[#F8FAFC] border border-[#E5EAF2]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[0.65rem] ${
                  statusFilter === tab.key
                    ? 'bg-blue-800 text-white'
                    : 'bg-slate-100 text-[#475569]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Assignments List ──────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-[#E5EAF2] bg-white p-5 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3.5">
          {filtered.map((asg) => {
            const doubt = asg.doubt || {};
            const isCancelling = isProcessingId === asg.id;
            const isConfirming = cancellingId === asg.id;

            return (
              <div
                key={asg.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[#E5EAF2] bg-white p-5 transition-all hover:border-[#BFDBFE] hover:shadow-xs group"
              >
                <div className="min-w-0 flex-1">
                  {/* Status & tags */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold ${
                        asg.status === 'ACTIVE'
                          ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                          : asg.status === 'COMPLETED'
                          ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {asg.status === 'ACTIVE' && <Clock size={11} />}
                      {asg.status === 'COMPLETED' && <CheckCircle size={11} />}
                      {asg.status === 'CANCELLED' && <XCircle size={11} />}
                      {asg.status}
                    </span>

                    {doubt.subject && (
                      <span className="text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full">
                        {doubt.subject}
                      </span>
                    )}
                    {doubt.topic && (
                      <span className="text-xs font-medium text-[#475569] bg-slate-100 px-2 py-0.5 rounded-full">
                        {doubt.topic}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold text-[#101B3D] group-hover:text-[#2563EB] transition-colors">
                    <Link href={`/doubts/${doubt.id || asg.doubtId}`}>{doubt.title || 'Academic Question'}</Link>
                  </h3>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-[#94A3B8]">
                    <span>
                      Asked by <strong className="text-[#344568]">{doubt.student?.name || 'Student'}</strong>
                    </span>
                    <span>·</span>
                    <span>Claimed {timeAgo(asg.assignedAt)}</span>
                    {asg.completedAt && (
                      <>
                        <span>·</span>
                        <span className="text-[#10B981]">
                          Completed {timeAgo(asg.completedAt)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F1F5F9]">
                  {asg.status === 'ACTIVE' && (
                    <>
                      {isConfirming ? (
                        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-1.5 text-xs">
                          <span className="text-red-700 font-semibold px-1">
                            Release doubt?
                          </span>
                          <button
                            type="button"
                            disabled={isCancelling}
                            onClick={() => onCancelAssignment && onCancelAssignment(asg.id)}
                            className="rounded-lg bg-red-600 px-2.5 py-1 text-white font-bold hover:bg-red-700 text-xs"
                          >
                            {isCancelling ? 'Releasing...' : 'Yes, Release'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setCancellingId(null)}
                            className="rounded-lg bg-white px-2 py-1 text-slate-700 border border-slate-200 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCancellingId(asg.id)}
                          className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Release Claim
                        </button>
                      )}
                    </>
                  )}

                  <Link
                    href={`/doubts/${doubt.id || asg.doubtId}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#1D4ED8] transition-all shadow-xs"
                  >
                    <span>{asg.status === 'ACTIVE' ? 'Answer Doubt' : 'View Question'}</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E5EAF2] bg-white py-14 text-center px-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
            <HelpCircle size={24} />
          </div>
          <h3 className="text-sm font-bold text-[#101B3D]">No assignments found</h3>
          <p className="text-xs text-[#64748B] mt-1">
            {statusFilter === 'ACTIVE'
              ? 'You currently have no active doubt assignments. Explore open questions to help someone learn!'
              : 'No assignments match the selected status.'}
          </p>
        </div>
      )}
    </div>
  );
}

