'use client';

import { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  User,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';

export default function KnowledgeModerationQueue({ currentUser }) {
  const [pendingItems, setPendingItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeItem, setActiveItem] = useState(null); // id of item being reviewed
  const [decision, setDecision] = useState('APPROVED'); // 'APPROVED' | 'REJECTED'
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchPending = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/knowledge/moderation');
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to fetch pending queue');
      } else {
        setPendingItems(data.resources || []);
      }
    } catch {
      setError('Network error while loading moderation queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleReviewSubmit = async (resourceId) => {
    if (decision === 'REJECTED' && !feedback.trim()) {
      alert('Feedback is required when requesting changes.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/knowledge/${resourceId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, feedback }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to submit review');
      } else {
        // Remove reviewed item from list
        setPendingItems((prev) => prev.filter((item) => item.id !== resourceId));
        setActiveItem(null);
        setFeedback('');
      }
    } catch {
      alert('Network error while submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#E5EAF2] bg-white p-6 animate-pulse space-y-3"
          >
            <div className="h-5 w-48 bg-slate-100 rounded" />
            <div className="h-4 w-3/4 bg-slate-100 rounded" />
            <div className="h-4 w-1/2 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-xs text-red-700">
        <AlertCircle size={20} className="mx-auto mb-2 text-red-500" />
        <p className="font-bold">{error}</p>
        <button
          type="button"
          onClick={fetchPending}
          className="mt-3 rounded-xl bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (pendingItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#A7F3D0] bg-[#ECFDF5]/50 py-16 px-6 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ECFDF5] text-emerald-600">
          <CheckCircle size={26} />
        </div>
        <h3 className="text-base font-bold text-[#101B3D]">Moderation Queue is Clear</h3>
        <p className="mt-1 text-xs text-[#64748B] max-w-sm">
          All submitted academic resources have been reviewed and approved or updated.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#64748B]">
          {pendingItems.length} {pendingItems.length === 1 ? 'Resource' : 'Resources'} Awaiting
          Review
        </span>
        <button
          type="button"
          onClick={fetchPending}
          className="text-xs font-semibold text-[#2563EB] hover:underline"
        >
          Refresh queue
        </button>
      </div>

      <div className="space-y-4">
        {pendingItems.map((item) => {
          const isReviewingThis = activeItem === item.id;
          const isExpanded = expandedId === item.id;
          const isAuthor = currentUser && currentUser.id === item.authorId;

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-2xs transition-all hover:border-[#BFDBFE]"
            >
              {/* Top metadata */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-bold text-[#2563EB]">
                    {item.subject}
                  </span>
                  {item.topic && (
                    <span className="rounded-full border border-[#E5EAF2] bg-[#F8FAFC] px-2.5 py-0.5 text-xs font-medium text-[#64748B]">
                      {item.topic}
                    </span>
                  )}
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[0.65rem] font-bold text-amber-700">
                    PENDING REVIEW
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                  <Clock size={12} />
                  <span>
                    Submitted{' '}
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-bold text-[#101B3D] mb-1">{item.title}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                {item.description || item.content?.slice(0, 160) + '...'}
              </p>

              {/* Author info */}
              <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3 text-xs">
                <div className="flex items-center gap-2 text-[#64748B]">
                  <User size={13} className="text-[#94A3B8]" />
                  <span className="font-semibold text-[#101B3D]">{item.author?.name}</span>
                  <span>({item.author?.role})</span>
                  <span>•</span>
                  <span>{item.author?.reputation || 0} Rep</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748B] hover:text-[#101B3D]"
                  >
                    {isExpanded ? (
                      <>
                        Collapse preview <ChevronUp size={13} />
                      </>
                    ) : (
                      <>
                        Preview full content <ChevronDown size={13} />
                      </>
                    )}
                  </button>

                  <Link
                    href={`/knowledge/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
                  >
                    Open article <ExternalLink size={12} />
                  </Link>
                </div>
              </div>

              {/* Expanded content preview */}
              {isExpanded && (
                <div className="mt-4 rounded-xl bg-[#F8FAFC] border border-[#E5EAF2] p-4 text-xs font-mono text-[#344568] whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                  {item.content}
                </div>
              )}

              {/* Review Action Controls */}
              {isAuthor && currentUser?.role !== 'ADMIN' ? (
                <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-xs text-amber-700 italic">
                  Note: You are the author of this submission. Another moderator or admin must review it.
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-[#F1F5F9]">
                  {!isReviewingThis ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveItem(item.id);
                          setDecision('APPROVED');
                          setFeedback('');
                        }}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveItem(item.id);
                          setDecision('REJECTED');
                          setFeedback('');
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
                      >
                        <XCircle size={13} /> Request Changes
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 rounded-xl bg-[#EFF6FF]/50 border border-blue-200 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#101B3D]">
                          {decision === 'APPROVED' ? 'Confirm Approval' : 'Specify Required Changes'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setDecision('APPROVED')}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                              decision === 'APPROVED'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white text-slate-600'
                            }`}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setDecision('REJECTED')}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                              decision === 'REJECTED'
                                ? 'bg-red-600 text-white'
                                : 'bg-white text-slate-600'
                            }`}
                          >
                            Request Changes
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder={
                          decision === 'APPROVED'
                            ? 'Optional positive reviewer note...'
                            : 'Explain what changes are needed before this resource can be approved...'
                        }
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full h-9 rounded-xl border border-blue-200 bg-white px-3 text-xs text-[#101B3D] placeholder-[#94A3B8] outline-none focus:border-[#2563EB]"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveItem(null)}
                          className="px-3 py-1 text-xs text-[#64748B] hover:text-[#101B3D]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting || (decision === 'REJECTED' && !feedback.trim())}
                          onClick={() => handleReviewSubmit(item.id)}
                          className="rounded-xl bg-[#2563EB] px-4 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#1D4ED8] disabled:opacity-50"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Decision'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
