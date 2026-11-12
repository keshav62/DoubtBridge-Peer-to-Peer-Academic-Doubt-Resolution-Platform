'use client';

import Link from 'next/link';
import { Eye, User, Clock, ArrowRight, BookOpen, ExternalLink } from 'lucide-react';
import BookmarkButton from './BookmarkButton';

export default function KnowledgeCard({ resource, onBookmarkChange }) {
  if (!resource) return null;

  // Approximate read time: ~200 words per minute
  const wordCount = (resource.content || '').split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const formattedDate = resource.createdAt
    ? new Date(resource.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const authorInitials = (resource.author?.name || 'Author')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isPending = resource.status === 'PENDING';
  const isDraft = resource.status === 'DRAFT';
  const isRejected = resource.status === 'REJECTED';

  return (
    <article className="flex flex-col rounded-2xl border border-[#E5EAF2] bg-white p-6 transition-all hover:border-[#BFDBFE] hover:shadow-xs group">
      {/* ── Top Bar ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-semibold text-[#2563EB]">
            {resource.subject}
          </span>
          {resource.topic && (
            <span className="inline-flex items-center rounded-full border border-[#E5EAF2] bg-[#F8FAFC] px-2 py-0.5 text-[0.7rem] font-medium text-[#64748B]">
              {resource.topic}
            </span>
          )}
          {isPending && (
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[0.65rem] font-bold text-amber-700">
              Pending Review
            </span>
          )}
          {isDraft && (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[0.65rem] font-bold text-slate-600">
              Draft
            </span>
          )}
          {isRejected && (
            <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[0.65rem] font-bold text-red-700">
              Changes Requested
            </span>
          )}
        </div>

        <BookmarkButton
          resourceId={resource.id}
          initialBookmarked={resource.isBookmarked}
          initialCount={resource.bookmarksCount || 0}
          onToggle={onBookmarkChange}
        />
      </div>

      {/* ── Title ──────────────────────────────────────────────── */}
      <h3 className="text-base font-bold text-[#101B3D] leading-snug mb-2 group-hover:text-[#2563EB] transition-colors">
        <Link href={`/knowledge/${resource.id}`} className="focus:outline-none">
          {resource.title}
        </Link>
      </h3>

      {/* ── Summary / Description ──────────────────────────────── */}
      <p className="text-xs text-[#64748B] leading-relaxed mb-4 line-clamp-3 flex-1">
        {resource.description || resource.content?.slice(0, 180) + '...'}
      </p>

      {/* ── Meta Info ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 text-xs text-[#94A3B8] mb-4">
        <span className="inline-flex items-center gap-1">
          <Clock size={12} />
          {readTimeMinutes} min read
        </span>
        <span>•</span>
        <span className="inline-flex items-center gap-1">
          <Eye size={12} />
          {resource.views || 0} views
        </span>
        {resource.sourceUrl && (
          <>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-[#2563EB]">
              <ExternalLink size={11} /> Source
            </span>
          </>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3 mt-auto">
        <div className="flex items-center gap-2">
          {resource.author?.avatar ? (
            <img
              src={resource.author.avatar}
              alt={resource.author.name}
              className="h-6 w-6 rounded-full object-cover border border-[#E5EAF2]"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EFF6FF] text-[0.65rem] font-bold text-[#2563EB]">
              {authorInitials}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#101B3D]">
              {resource.author?.name || 'Academic Contributor'}
            </span>
            <span className="text-[0.65rem] text-[#94A3B8]">{formattedDate}</span>
          </div>
        </div>

        <Link
          href={`/knowledge/${resource.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
        >
          Read <ArrowRight size={12} />
        </Link>
      </div>
    </article>
  );
}

