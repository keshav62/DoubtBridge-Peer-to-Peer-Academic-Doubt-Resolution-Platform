'use client';

import { useState } from 'react';
import { Send, RotateCcw, AlertCircle, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

const MIN_LENGTH = 5;
const MAX_LENGTH = 5000;

export default function AnswerForm({ doubtId, onAnswerSubmitted, isClosed = false }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const trimmedLength = content.trim().length;
  const isTooShort = trimmedLength > 0 && trimmedLength < MIN_LENGTH;
  const isTooLong = trimmedLength > MAX_LENGTH;
  const canSubmit = trimmedLength >= MIN_LENGTH && !isTooLong && !submitting && !isClosed;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/doubts/${doubtId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit answer.');
      }

      // Success
      setSuccess(
        data.message ||
          'Your answer has been submitted and is currently pending moderation review.'
      );
      setContent('');

      if (onAnswerSubmitted) {
        onAnswerSubmitted(data.answer);
      }
    } catch (err) {
      console.error('Answer submission error:', err);
      setError(err.message || 'Something went wrong while posting your answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setContent('');
    setError(null);
    setSuccess(null);
  };

  if (isClosed) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-[#64748B]">
        This academic doubt is marked as closed. Further answer contributions are disabled.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[#101B3D]">Contribute an Answer</h3>
        <p className="mt-0.5 text-xs text-[#64748B]">
          Provide a thorough, step-by-step academic explanation or working solution.
        </p>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Answer Submitted</p>
            <p className="mt-0.5 text-emerald-700">{success}</p>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-800">
          <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Submission Failed</p>
            <p className="mt-0.5 text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            rows={5}
            value={content}
            disabled={submitting}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Write your explanation, steps, or code breakdown here (minimum 5 characters)..."
            className="w-full resize-y rounded-xl border border-[#E5EAF2] bg-white p-3.5 text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 disabled:bg-slate-50 min-h-[120px]"
          />
        </div>

        {/* Form Meta & Validation Note */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <ShieldCheck size={14} className="text-[#2563EB]" />
            <span>Answers follow standard peer-moderation workflow</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isTooShort && (
              <span className="text-amber-600 font-medium">
                Minimum 5 characters required ({trimmedLength}/5)
              </span>
            )}
            {isTooLong && (
              <span className="text-red-600 font-medium">
                Exceeds max length ({trimmedLength}/{MAX_LENGTH})
              </span>
            )}
            <span className="text-[#94A3B8]">
              {trimmedLength} / {MAX_LENGTH}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={14} />
                Submit Answer
              </>
            )}
          </button>

          {content && !submitting && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-[#64748B] hover:bg-slate-50 transition-colors"
            >
              <RotateCcw size={13} />
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

