'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ThumbsUp, CheckCircle, Clock, BookOpen, Send, User } from 'lucide-react';

export default function DoubtDetailPage() {
  const [answers, setAnswers] = useState([
    {
      id: 'ans-1',
      author: 'Dr. Priya Sharma',
      authorRole: 'Peer Mentor',
      karma: '890 Karma',
      initials: 'PS',
      content:
        'Dijkstra operates on a greedy choice property: it permanently marks vertices as visited assuming their distance cannot be shortened later. In negative edge weight scenarios, this assumption is broken because a longer sequence of vertices can have a smaller cumulative cost. Use Bellman-Ford or SPFA instead when negative edge weights are present.',
      upvotes: 14,
      isAccepted: true,
      createdAt: '2 hours ago',
    },
  ]);
  const [newAnswer, setNewAnswer] = useState('');

  const handlePostAnswer = (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    setAnswers([
      ...answers,
      {
        id: `ans-${Date.now()}`,
        author: 'Alex Rivera (You)',
        authorRole: 'Student',
        karma: '150 Karma',
        initials: 'AR',
        content: newAnswer,
        upvotes: 0,
        isAccepted: false,
        createdAt: 'Just now',
      },
    ]);
    setNewAnswer('');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ── Back link ────────────────────────────────────────── */}
      <Link
        href="/doubts"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#2563EB] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Doubts
      </Link>

      {/* ── Main question card ───────────────────────────────── */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 md:p-8">
        {/* Tags */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            CLAIMED
          </span>
          <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-semibold text-[#2563EB]">
            Algorithms
          </span>
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
            High Urgency
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-[#101B3D] leading-snug mb-4">
          How does Dijkstra algorithm handle negative weight cycles?
        </h1>

        {/* Description */}
        <p className="text-sm text-[#344568] leading-relaxed mb-6">
          I understand Dijkstra's greedy approach for shortest paths, but why does it fail or enter
          infinite loops with negative edge weights compared to Bellman-Ford? Could someone explain
          how relaxation differs between the two?
        </p>

        {/* Meta footer */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-[#F1F5F9] pt-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-1.5">
            <User size={13} />
            Asked by <span className="font-semibold text-[#344568]">Alex Rivera</span> · 3 hours ago
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen size={13} />
            Helper: <span className="font-semibold text-[#2563EB]">Dr. Priya Sharma</span>
          </div>
        </div>
      </div>

      {/* ── Answers section ──────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-[#101B3D] mb-4">
          Answers &amp; Explanations ({answers.length})
        </h2>

        <div className="space-y-4">
          {answers.map((ans) => (
            <div
              key={ans.id}
              className={[
                'rounded-2xl border bg-white p-6',
                ans.isAccepted
                  ? 'border-[#10B981]/30 ring-1 ring-[#10B981]/20'
                  : 'border-[#E5EAF2]',
              ].join(' ')}
            >
              {/* Author row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-[0.7rem] font-bold text-white">
                    {ans.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#101B3D]">{ans.author}</p>
                    <p className="text-xs text-[#64748B]">
                      {ans.authorRole} · {ans.karma}
                    </p>
                  </div>
                </div>
                {ans.isAccepted && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-0.5 text-xs font-semibold text-[#059669]">
                    <CheckCircle size={11} />
                    Accepted Solution
                  </span>
                )}
              </div>

              {/* Content */}
              <p className="text-sm text-[#344568] leading-relaxed mb-4">{ans.content}</p>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3">
                <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                  <Clock size={12} />
                  {ans.createdAt}
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5EAF2] bg-white px-3 py-1.5 text-xs font-medium text-[#344568] hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-all"
                >
                  <ThumbsUp size={12} />
                  Upvote ({ans.upvotes})
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Post answer form ─────────────────────────────────── */}
      <form
        onSubmit={handlePostAnswer}
        className="rounded-2xl border border-[#E5EAF2] bg-white p-6"
      >
        <h3 className="text-base font-bold text-[#101B3D] mb-4">
          Contribute an Answer
        </h3>
        <textarea
          rows={4}
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          placeholder="Provide a step-by-step mathematical or conceptual explanation..."
          className="mb-4 w-full resize-y rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-3 text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none transition-all focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10 min-h-[100px]"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-[#1D4ED8] transition-all"
        >
          <Send size={14} />
          Submit Answer
        </button>
      </form>
    </div>
  );
}
