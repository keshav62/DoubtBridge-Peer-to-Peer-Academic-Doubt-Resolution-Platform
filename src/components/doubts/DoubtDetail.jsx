'use client';

import Link from 'next/link';
import { ArrowLeft, User, BookOpen, Clock, Tag, CheckCircle2 } from 'lucide-react';
import DoubtStatusBadge from './DoubtStatusBadge';
import { timeAgo } from '@/lib/utils';

const URGENCY_STYLES = {
  HIGH: 'bg-red-50 text-red-600 border-red-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  LOW: 'bg-slate-50 text-slate-600 border-slate-200',
};

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function DoubtDetail({ doubt }) {
  if (!doubt) return null;

  const tagsList = doubt.tags
    ? doubt.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const studentName = doubt.student?.name || 'Student';
  const studentInitials = getInitials(studentName);

  return (
    <div className="space-y-4">
      {/* ── Back Navigation ────────────────────────────────────── */}
      <div>
        <Link
          href="/doubts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Academic Doubts
        </Link>
      </div>

      {/* ── Main Doubt Card ────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 md:p-8 shadow-xs">
        {/* Badges Row */}
        <div className="flex items-center gap-2 mb-3.5 flex-wrap">
          <DoubtStatusBadge status={doubt.status} />

          <span className="inline-flex items-center rounded-full bg-[#EFF6FF] text-[#2563EB] px-2.5 py-0.5 text-xs font-semibold">
            {doubt.subject}
          </span>

          {doubt.topic && (
            <span className="inline-flex items-center rounded-full bg-slate-50 text-[#344568] border border-slate-200 px-2.5 py-0.5 text-xs font-medium">
              {doubt.topic}
            </span>
          )}

          {doubt.difficulty && (
            <span className="inline-flex items-center rounded-full bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-0.5 text-xs font-medium">
              {doubt.difficulty}
            </span>
          )}

          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              URGENCY_STYLES[doubt.urgency] || URGENCY_STYLES.LOW
            }`}
          >
            {doubt.urgency} Urgency
          </span>
        </div>

        {/* Doubt Title */}
        <h1 className="text-xl md:text-2xl font-bold text-[#101B3D] leading-snug mb-4">
          {doubt.title}
        </h1>

        {/* Doubt Description */}
        <div className="text-sm text-[#344568] leading-relaxed mb-6 whitespace-pre-line">
          {doubt.description}
        </div>

        {/* Tags */}
        {tagsList.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-6 pt-2 border-t border-slate-100">
            <Tag size={13} className="text-[#94A3B8] mr-1" />
            {tagsList.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-lg bg-slate-100/80 px-2 py-0.5 text-[11px] font-medium text-[#475569]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#F1F5F9] pt-4 text-xs text-[#64748B]">
          {/* Author info */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-[#344568]">
              {studentInitials}
            </div>
            <div>
              <span className="text-[#344568] font-semibold">{studentName}</span>
              {doubt.student?.department && (
                <span className="text-[#94A3B8]"> · {doubt.student.department}</span>
              )}
              <span className="text-[#94A3B8]"> · Asked {timeAgo(doubt.createdAt)}</span>
            </div>
          </div>

          {/* Assigned Helper or Resolution Status */}
          <div className="flex items-center gap-3">
            {doubt.helper ? (
              <div className="flex items-center gap-1.5 text-[#2563EB] font-medium">
                <BookOpen size={13} />
                <span>Assigned Helper: <strong>{doubt.helper.name}</strong></span>
              </div>
            ) : null}

            {doubt.resolvedAt && (
              <div className="flex items-center gap-1 text-[#059669] font-medium">
                <CheckCircle2 size={13} />
                <span>Resolved {timeAgo(doubt.resolvedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

