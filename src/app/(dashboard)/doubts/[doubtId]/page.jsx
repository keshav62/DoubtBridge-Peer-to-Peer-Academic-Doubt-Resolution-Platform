'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  CheckCircle2,
  X,
} from 'lucide-react';
import DoubtDetail from '@/components/doubts/DoubtDetail';
import AnswerList from '@/components/doubts/AnswerList';
import AnswerForm from '@/components/doubts/AnswerForm';
import Button from '@/components/ui/Button';

/**
 * Loading skeleton shimmer for Doubt Details page.
 */
function DoubtDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-pulse">
      {/* Back button placeholder */}
      <div className="h-4 w-28 rounded bg-slate-200" />

      {/* Main question card skeleton */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 md:p-8 space-y-4">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full bg-slate-200" />
          <div className="h-5 w-24 rounded-full bg-slate-200" />
          <div className="h-5 w-20 rounded-full bg-slate-100" />
        </div>
        <div className="h-7 w-3/4 rounded bg-slate-200" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-5/6 rounded bg-slate-100" />
          <div className="h-4 w-4/6 rounded bg-slate-100" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="h-4 w-32 rounded bg-slate-100" />
          <div className="h-4 w-24 rounded bg-slate-100" />
        </div>
      </div>

      {/* Answer list skeleton */}
      <div className="space-y-4">
        <div className="h-5 w-40 rounded bg-slate-200" />
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 space-y-3">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-3/4 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export default function DoubtDetailPage() {
  const params = useParams();
  const doubtId = params?.doubtId;

  const [doubt, setDoubt] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fetch doubt data
  const fetchDoubt = useCallback(async () => {
    if (!doubtId) return;

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const response = await fetch(`/api/doubts/${doubtId}`);
      const data = await response.json();

      if (response.status === 404 || (!response.ok && data.error?.includes('not found'))) {
        setNotFound(true);
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load doubt details.');
      }

      setDoubt(data.doubt);
      if (data.currentUser) {
        setCurrentUser(data.currentUser);
      }
    } catch (err) {
      console.error('Error fetching doubt:', err);
      setError(err.message || 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  }, [doubtId]);

  useEffect(() => {
    fetchDoubt();
  }, [fetchDoubt]);

  // Handle Answer Submission callback
  const handleAnswerSubmitted = (newAnswer) => {
    setDoubt((prev) => {
      if (!prev) return prev;
      const updatedAnswers = [newAnswer, ...(prev.answers || [])];
      return {
        ...prev,
        answers: updatedAnswers,
        _count: {
          ...prev._count,
          answers: (prev._count?.answers || 0) + 1,
        },
      };
    });

    setNotification({
      type: 'success',
      text: 'Your answer was submitted successfully and is pending review!',
    });
  };

  // Handle Accept Answer callback
  const handleAcceptAnswer = async (answerId) => {
    if (isAccepting) return;
    setIsAccepting(true);
    setNotification(null);

    try {
      const response = await fetch(
        `/api/doubts/${doubtId}/answers/${answerId}/accept`,
        { method: 'POST' }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to accept solution.');
      }

      // Update state locally
      setDoubt((prev) => {
        if (!prev) return prev;
        const updatedAnswers = (prev.answers || []).map((ans) =>
          ans.id === answerId ? { ...ans, isAccepted: true } : ans
        );
        return {
          ...prev,
          status: 'RESOLVED',
          resolvedAt: new Date().toISOString(),
          answers: updatedAnswers,
        };
      });

      setNotification({
        type: 'success',
        text: 'Solution accepted! This doubt is now resolved.',
      });
    } catch (err) {
      console.error('Error accepting answer:', err);
      setNotification({
        type: 'error',
        text: err.message || 'Failed to accept answer.',
      });
    } finally {
      setIsAccepting(false);
    }
  };

  // Handle Moderation Review callback
  const handleModerateAnswer = async (answerId, decision, feedback) => {
    try {
      const response = await fetch(
        `/api/doubts/${doubtId}/answers/${answerId}/review`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision, feedback }),
        }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to moderate answer.');
      }

      // Update answer status in local state
      setDoubt((prev) => {
        if (!prev) return prev;
        const updatedAnswers = (prev.answers || []).map((ans) =>
          ans.id === answerId ? data.answer : ans
        );
        const shouldUpdateDoubtStatus =
          decision === 'APPROVED' && (prev.status === 'OPEN' || prev.status === 'CLAIMED');

        return {
          ...prev,
          status: shouldUpdateDoubtStatus ? 'ANSWERED' : prev.status,
          answers: updatedAnswers,
        };
      });

      setNotification({
        type: 'success',
        text: `Answer ${decision.toLowerCase()} successfully!`,
      });
    } catch (err) {
      console.error('Error moderating answer:', err);
      setNotification({
        type: 'error',
        text: err.message || 'Failed to moderate answer.',
      });
    }
  };

  // Handle Upvote callback
  const handleUpvoteAnswer = async (answerId) => {
    const res = await fetch(`/api/doubts/${doubtId}/answers/${answerId}/upvote`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to upvote');
    }
    return data;
  };

  // 1. Loading State
  if (loading) {
    return <DoubtDetailSkeleton />;
  }

  // 2. Not Found State (404)
  if (notFound) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <HelpCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-[#101B3D]">Doubt Not Found</h2>
        <p className="mt-2 text-sm text-[#64748B] max-w-md mx-auto">
          The academic doubt you are trying to view does not exist or may have been removed.
        </p>
        <div className="mt-6">
          <Link
            href="/doubts"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Doubts Feed
          </Link>
        </div>
      </div>
    );
  }

  // 3. Error State
  if (error || !doubt) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-lg font-bold text-[#101B3D]">Unable to Load Doubt</h2>
        <p className="mt-1 text-sm text-[#64748B]">{error || 'Unknown error occurred.'}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchDoubt}
            className="inline-flex items-center gap-1.5"
          >
            <RefreshCw size={14} />
            Try Again
          </Button>
          <Link
            href="/doubts"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-[#344568] hover:bg-slate-50"
          >
            Back to Doubts
          </Link>
        </div>
      </div>
    );
  }

  // 4. Main Detail Content
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Toast / Banner Notification */}
      {notification && (
        <div
          className={`flex items-start justify-between gap-3 rounded-2xl border p-4 text-xs transition-all ${
            notification.type === 'success'
              ? 'border-emerald-200 bg-emerald-50/90 text-emerald-800'
              : 'border-red-200 bg-red-50/90 text-red-800'
          }`}
          role="alert"
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-red-600 shrink-0" />
            )}
            <span className="font-medium">{notification.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-0.5 rounded-full hover:bg-black/5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Doubt Question */}
      <DoubtDetail doubt={doubt} />

      {/* Answers Section */}
      <AnswerList
        answers={doubt.answers || []}
        doubt={doubt}
        currentUser={currentUser}
        onAccept={handleAcceptAnswer}
        onModerate={handleModerateAnswer}
        onUpvote={handleUpvoteAnswer}
        isAccepting={isAccepting}
      />

      {/* Contribute an Answer Form */}
      <AnswerForm
        doubtId={doubt.id}
        onAnswerSubmitted={handleAnswerSubmitted}
        isClosed={doubt.status === 'CLOSED'}
      />
    </div>
  );
}
