'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MessageSquare, Edit, ChevronLeft, RefreshCw, AlertCircle, Check } from 'lucide-react';

const PAGE_SIZE = 10;

export default function SolutionsByMePage() {
  const [solutions, setSolutions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSolutions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      const offset = (page - 1) * PAGE_SIZE;
      params.set('limit', PAGE_SIZE.toString());
      params.set('offset', offset.toString());

      const response = await fetch(`/api/answers/my?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch solutions');
      }

      setSolutions(data.answers || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching solutions:', err);
      setError(err.message || 'Something went wrong while loading solutions.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  const handleEdit = (answer) => {
    setEditingAnswer(answer.id);
    setEditContent(answer.content);
  };

  const handleCancelEdit = () => {
    setEditingAnswer(null);
    setEditContent('');
  };

  const handleSaveEdit = async (answerId) => {
    if (!editContent.trim()) {
      alert('Answer content cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/answers/${answerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update answer');
      }

      // Update local state
      setSolutions((prev) =>
        prev.map((s) =>
          s.id === answerId ? { ...s, content: editContent.trim(), updatedAt: new Date().toISOString() } : s
        )
      );

      setEditingAnswer(null);
      setEditContent('');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101B3D]">
            Solutions by Me
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            View and edit all answers you have submitted to community doubts.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchSolutions}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2 text-xs font-semibold text-[#344568] hover:border-[#BFDBFE] hover:bg-[#F8FAFC] transition-all disabled:opacity-50 shadow-xs self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
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
            onClick={fetchSolutions}
            className="font-bold underline hover:no-underline ml-4"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── Solutions List ───────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl border border-[#E5EAF2] bg-white p-6 animate-pulse" />
          ))}
        </div>
      ) : solutions.length === 0 ? (
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-12 text-center">
          <MessageSquare size={48} className="mx-auto text-[#94A3B8] mb-4" />
          <h3 className="text-lg font-bold text-[#101B3D] mb-2">No solutions yet</h3>
          <p className="text-sm text-[#64748B] mb-6">
            You haven't submitted any answers to doubts yet. Start helping others by browsing open doubts.
          </p>
          <Link
            href="/doubts"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-all"
          >
            Browse Doubts
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {solutions.map((solution) => (
            <div
              key={solution.id}
              className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs"
            >
              {/* ── Solution Header ─────────────────────────────────── */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/doubts/${solution.doubt.id}`}
                    className="text-base font-bold text-[#101B3D] hover:text-[#2563EB] transition-colors mb-2 block"
                  >
                    {solution.doubt.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-[#EFF6FF] text-[#2563EB]">
                      {solution.doubt.subject}
                    </span>
                    <span>•</span>
                    <span>Answered {new Date(solution.createdAt).toLocaleDateString()}</span>
                    {solution.updatedAt !== solution.createdAt && (
                      <>
                        <span>•</span>
                        <span>Edited {new Date(solution.updatedAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    solution.status === 'APPROVED'
                      ? 'bg-[#ECFDF5] text-[#10B981]'
                      : solution.status === 'REJECTED'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    {solution.status}
                  </span>
                  {solution.isAccepted && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-[#EFF6FF] text-[#2563EB]">
                      <Check size={12} />
                      Accepted
                    </span>
                  )}
                </div>
              </div>

              {/* ── Solution Content ─────────────────────────────────── */}
              {editingAnswer === solution.id ? (
                <div className="space-y-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={6}
                    className="w-full rounded-xl border border-[#E5EAF2] bg-[#F8FAFC] p-4 text-sm text-[#101B3D] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 resize-none"
                    placeholder="Edit your answer..."
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(solution.id)}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-all disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAF2] bg-white px-4 py-2 text-xs font-semibold text-[#344568] hover:bg-[#F8FAFC] transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-[#344568] mb-4">
                  <p className="whitespace-pre-wrap">{solution.content}</p>
                </div>
              )}

              {/* ── Solution Footer ─────────────────────────────────── */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E5EAF2]">
                <div className="flex items-center gap-4 text-xs text-[#64748B]">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    {solution.upvotes} upvotes
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleEdit(solution)}
                  disabled={editingAnswer !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5EAF2] bg-white px-3 py-1.5 text-xs font-semibold text-[#344568] hover:bg-[#F8FAFC] hover:text-[#2563EB] transition-all disabled:opacity-50"
                >
                  <Edit size={13} />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────── */}
      {!loading && !error && total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E5EAF2]">
          <p className="text-xs text-[#64748B]">
            Showing <span className="font-medium text-[#101B3D]">{startItem}</span> to{' '}
            <span className="font-medium text-[#101B3D]">{endItem}</span> of{' '}
            <span className="font-medium text-[#101B3D]">{total}</span> solutions
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-[#E5EAF2] bg-white px-3 py-1.5 text-xs font-medium text-[#344568] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
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
