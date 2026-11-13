'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Flag, ExternalLink, CheckCircle, XCircle, Loader2, AlertCircle, MessageSquare, HelpCircle } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

export default function AdminReportTable({ reports, loading, onReportUpdated }) {
  const [activeModalReport, setActiveModalReport] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('REVIEWED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleReviewReport = async () => {
    if (!activeModalReport) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/reports/${activeModalReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewStatus,
          resolutionNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to update report.');
        setSubmitting(false);
        return;
      }

      if (onReportUpdated) onReportUpdated(data.report);
      setActiveModalReport(null);
      setResolutionNotes('');
    } catch {
      setError('Network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 w-full rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E5EAF2] bg-white p-12 text-center">
        <Flag size={24} className="text-[#94A3B8] mb-2" />
        <p className="text-sm font-bold text-[#101B3D]">No reports found</p>
        <p className="text-xs text-[#64748B] mt-1">There are no user reports matching the selected status.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-[#E5EAF2] bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E5EAF2] bg-[#F8FAFC]">
              <th className="py-3.5 pl-5 pr-3 font-semibold text-[#64748B] uppercase tracking-wider">Reported Item</th>
              <th className="px-3 py-3.5 font-semibold text-[#64748B] uppercase tracking-wider">Reason</th>
              <th className="px-3 py-3.5 font-semibold text-[#64748B] uppercase tracking-wider">Reporter</th>
              <th className="px-3 py-3.5 font-semibold text-[#64748B] uppercase tracking-wider">Date</th>
              <th className="px-3 py-3.5 font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
              <th className="py-3.5 pl-3 pr-5 text-right font-semibold text-[#64748B] uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5EAF2]">
            {reports.map((r) => {
              const isPending = r.status === 'PENDING';
              const targetDoubtId = r.doubtId || r.answer?.doubtId;

              return (
                <tr key={r.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                  {/* Reported Item */}
                  <td className="py-3.5 pl-5 pr-3">
                    <div className="flex items-start gap-2.5 max-w-sm">
                      {r.doubt ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0 mt-0.5">
                          <HelpCircle size={14} />
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] flex-shrink-0 mt-0.5">
                          <MessageSquare size={14} />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-[#101B3D] block truncate">
                          {r.doubt ? `Doubt: ${r.doubt.title}` : `Answer on doubt`}
                        </span>
                        {r.answer && (
                          <p className="text-[#64748B] text-[0.7rem] line-clamp-1 italic">
                            &quot;{r.answer.content}&quot;
                          </p>
                        )}
                        {targetDoubtId && (
                          <Link
                            href={`/doubts/${targetDoubtId}`}
                            className="inline-flex items-center gap-1 text-[0.65rem] font-semibold text-[#2563EB] hover:underline mt-0.5"
                          >
                            View context <ExternalLink size={10} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Reason */}
                  <td className="px-3 py-3.5 text-[#344568] max-w-xs">
                    <span className="font-medium text-[#101B3D] block">{r.reason}</span>
                    {r.resolutionNotes && (
                      <span className="text-[0.65rem] text-[#64748B] block mt-0.5 italic">
                        Resolution: {r.resolutionNotes}
                      </span>
                    )}
                  </td>

                  {/* Reporter */}
                  <td className="px-3 py-3.5 whitespace-nowrap text-[#64748B]">
                    <span className="font-semibold text-[#101B3D] block">{r.reporter?.name || 'User'}</span>
                    <span className="text-[0.65rem]">{r.reporter?.email}</span>
                  </td>

                  {/* Timestamp */}
                  <td className="px-3 py-3.5 whitespace-nowrap text-[#64748B]">
                    <span>{timeAgo(r.createdAt)}</span>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    {r.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Pending
                      </span>
                    )}
                    {r.status === 'REVIEWED' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Reviewed
                      </span>
                    )}
                    {r.status === 'DISMISSED' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        Dismissed
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                    {isPending ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModalReport(r);
                          setReviewStatus('REVIEWED');
                          setResolutionNotes('');
                          setError('');
                        }}
                        className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors"
                      >
                        Review Report
                      </button>
                    ) : (
                      <span className="text-xs text-[#94A3B8]">Completed</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {activeModalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101B3D]/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Flag size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101B3D]">Review Community Report</h3>
                <p className="text-xs text-[#64748B]">Reported reason: &quot;{activeModalReport.reason}&quot;</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4 mb-6">
              {/* Decision selection */}
              <div>
                <label className="block text-xs font-semibold text-[#344568] mb-1.5">
                  Resolution Decision
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus('REVIEWED')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      reviewStatus === 'REVIEWED'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-[#E5EAF2] text-[#64748B] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <CheckCircle size={14} />
                    Mark Reviewed
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus('DISMISSED')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      reviewStatus === 'DISMISSED'
                        ? 'border-slate-600 bg-slate-100 text-slate-800'
                        : 'border-[#E5EAF2] text-[#64748B] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <XCircle size={14} />
                    Dismiss Report
                  </button>
                </div>
              </div>

              {/* Resolution Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#344568] mb-1.5">
                  Administrative Resolution Notes
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Explain actions taken (e.g. content inspected, deemed compliant or edited)..."
                  className="w-full rounded-xl border border-[#E5EAF2] p-2.5 text-xs text-[#101B3D] placeholder-[#94A3B8] outline-none focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setActiveModalReport(null)}
                className="rounded-xl border border-[#E5EAF2] px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleReviewReport}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Submit Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
