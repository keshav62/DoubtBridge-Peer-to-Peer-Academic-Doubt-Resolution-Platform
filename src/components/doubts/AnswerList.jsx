'use client';

import { MessageSquare, CheckCircle } from 'lucide-react';
import AnswerCard from './AnswerCard';
import EmptyState from '@/components/ui/EmptyState';

export default function AnswerList({
  answers = [],
  doubt,
  currentUser,
  onAccept,
  onModerate,
  onUpvote,
  isAccepting = false,
}) {
  const acceptedAnswer = answers.find((a) => a.isAccepted);

  return (
    <div className="space-y-4">
      {/* ── Section Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#101B3D] flex items-center gap-2">
          <span>Answers &amp; Explanations</span>
          <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-semibold text-[#2563EB]">
            {answers.length}
          </span>
        </h2>

        {acceptedAnswer && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#059669]">
            <CheckCircle size={13} />
            Solution Resolved
          </span>
        )}
      </div>

      {/* ── Empty State ────────────────────────────────────────── */}
      {answers.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={28} />}
          title="No answers yet"
          description={`Be the first peer to provide an explanation and help ${
            doubt?.student?.name || 'this student'
          } resolve their doubt!`}
        />
      ) : (
        <div className="space-y-4">
          {answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              doubt={doubt}
              currentUser={currentUser}
              onAccept={onAccept}
              onModerate={onModerate}
              onUpvote={onUpvote}
              isAccepting={isAccepting}
            />
          ))}
        </div>
      )}
    </div>
  );
}

