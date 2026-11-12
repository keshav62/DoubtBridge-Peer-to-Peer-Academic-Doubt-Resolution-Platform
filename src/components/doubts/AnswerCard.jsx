'use client';

import { useState } from 'react';
import {
  ThumbsUp,
  CheckCircle,
  Clock,
  Check,
  X,
  ShieldAlert,
  Award,
} from 'lucide-react';
import AnswerStatusBadge from './AnswerStatusBadge';
import { timeAgo } from '@/lib/utils';

/**
 * Extracts initials from a user's name for avatar fallback.
 */
function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AnswerCard({
  answer,
  doubt,
  currentUser,
  onAccept,
  onModerate,
  onUpvote,
  isAccepting = false,
}) {
  const [upvotes, setUpvotes] = useState(answer.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [isSubmittingModeration, setIsSubmittingModeration] = useState(false);

  const authorName = answer.author?.name || 'Anonymous Peer';
  const authorRole = answer.author?.role || 'STUDENT';
  const authorReputation = answer.author?.reputation ?? 0;
  const initials = getInitials(authorName);

  // Authorization checks
  const isDoubtOwner = currentUser && doubt && (currentUser.id === doubt.studentId || currentUser.role === 'ADMIN');
  const isAnswerAuthor = currentUser && currentUser.id === answer.authorId;
  const isModeratorOrAdmin = currentUser && (currentUser.role === 'MODERATOR' || currentUser.role === 'ADMIN');
  const doubtHasAcceptedSolution = Boolean(doubt?.resolvedAt || doubt?.status === 'RESOLVED');

  // Can the current user accept this answer?
  const canAccept =
    isDoubtOwner &&
    !doubtHasAcceptedSolution &&
    !answer.isAccepted &&
    answer.status === 'APPROVED' &&
    (!isAnswerAuthor || currentUser?.role === 'ADMIN');

  // Can the current user moderate this answer?
  const canReview =
    isModeratorOrAdmin &&
    answer.status === 'PENDING' &&
    !isAnswerAuthor;

  // Handle upvoting
  const handleUpvote = async () => {
    if (isUpvoting || hasUpvoted) return;
    setIsUpvoting(true);

    try {
      if (onUpvote) {
        await onUpvote(answer.id);
      } else {
        await fetch(`/api/doubts/${doubt.id}/answers/${answer.id}/upvote`, {
          method: 'POST',
        });
      }
      setUpvotes((v) => v + 1);
      setHasUpvoted(true);
    } catch (err) {
      console.error('Failed to upvote:', err);
    } finally {
      setIsUpvoting(false);
    }
  };

  // Handle moderation decision
  const handleModerate = async (decision) => {
    if (isSubmittingModeration) return;
    setIsSubmittingModeration(true);

    try {
      await onModerate(answer.id, decision, decision === 'REJECTED' ? rejectFeedback : undefined);
      setShowRejectInput(false);
      setRejectFeedback('');
    } catch (err) {
      console.error('Failed to moderate answer:', err);
    } finally {
      setIsSubmittingModeration(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border bg-white p-6 transition-all ${
        answer.isAccepted
          ? 'border-[#10B981] bg-[#F0FDF4]/30 ring-2 ring-[#10B981]/20 shadow-sm'
          : answer.status === 'PENDING'
          ? 'border-amber-200 bg-amber-50/20'
          : 'border-[#E5EAF2]'
      }`}
    >
      {/* ── Top Header Row ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        {/* Author info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-xs font-bold text-white shadow-sm">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-[#101B3D]">
                {authorName}
              </span>
              {isAnswerAuthor && (
                <span className="text-[10px] font-medium bg-slate-100 text-[#344568] px-2 py-0.5 rounded-full">
                  You
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B]">
              {authorRole === 'HELPER' ? 'Peer Helper' : authorRole} · {authorReputation} Rep
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {answer.isAccepted && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#059669] shadow-xs">
              <CheckCircle size={13} className="shrink-0" />
              Accepted Solution
            </span>
          )}
          <AnswerStatusBadge status={answer.status} />
        </div>
      </div>

      {/* ── Answer Content ────────────────────────────────────── */}
      <div className="text-sm text-[#344568] leading-relaxed mb-5 whitespace-pre-line">
        {answer.content}
      </div>

      {/* ── Moderation Feedback (if rejected or reviewed) ─────── */}
      {answer.reviews && answer.reviews.length > 0 && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-[#344568]">
          <div className="flex items-center gap-1.5 font-semibold text-[#101B3D] mb-1">
            <ShieldAlert size={14} className="text-[#2563EB]" />
            Moderator Review Note
          </div>
          <p className="text-[#64748B]">
            Decision: <span className="font-medium text-[#101B3D]">{answer.reviews[0].decision}</span> by{' '}
            <span className="font-medium">{answer.reviews[0].reviewer?.name || 'Moderator'}</span> ·{' '}
            {timeAgo(answer.reviews[0].reviewedAt)}
          </p>
          {answer.reviews[0].feedback && (
            <p className="mt-1 text-slate-700 italic">
              &quot;{answer.reviews[0].feedback}&quot;
            </p>
          )}
        </div>
      )}

      {/* ── Moderator Quick Actions (for pending answers) ─────── */}
      {canReview && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
          <p className="text-xs font-semibold text-amber-900 mb-2">
            Moderator Action Required: Review this newly submitted answer
          </p>
          {!showRejectInput ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSubmittingModeration}
                onClick={() => handleModerate('APPROVED')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#059669] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#047857] disabled:opacity-50 transition-colors"
              >
                <Check size={13} />
                Approve Answer
              </button>
              <button
                type="button"
                disabled={isSubmittingModeration}
                onClick={() => setShowRejectInput(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                <X size={13} />
                Reject...
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                placeholder="Reason for rejection (feedback to author)..."
                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs text-[#101B3D] outline-none focus:border-red-500"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmittingModeration}
                  onClick={() => handleModerate('REJECTED')}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Confirm Reject
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectInput(false);
                    setRejectFeedback('');
                  }}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-[#64748B] hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Card Footer Actions ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#F1F5F9] pt-3 text-xs">
        <div className="flex items-center gap-1.5 text-[#94A3B8]">
          <Clock size={12} />
          <span>Answered {timeAgo(answer.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Upvote button */}
          <button
            type="button"
            disabled={isUpvoting || hasUpvoted}
            onClick={handleUpvote}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-medium transition-all ${
              hasUpvoted
                ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] font-semibold'
                : 'border-[#E5EAF2] bg-white text-[#344568] hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#2563EB]'
            }`}
          >
            <ThumbsUp size={12} className={hasUpvoted ? 'fill-current' : ''} />
            <span>Upvote ({upvotes})</span>
          </button>

          {/* Accept as Solution button (Doubt owner only) */}
          {canAccept && (
            <button
              type="button"
              disabled={isAccepting}
              onClick={() => onAccept(answer.id)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#059669] px-3.5 py-1.5 font-semibold text-white shadow-xs hover:bg-[#047857] disabled:opacity-50 transition-all"
            >
              <Award size={13} />
              {isAccepting ? 'Accepting...' : 'Accept Solution'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

