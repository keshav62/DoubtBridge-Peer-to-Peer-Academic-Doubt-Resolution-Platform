'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  User,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  Share2,
} from 'lucide-react';
import BookmarkButton from './BookmarkButton';
import RelatedArticles from './RelatedArticles';

export default function KnowledgeArticleDetail({
  resource,
  related = [],
  currentUser = null,
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [reviewAction, setReviewAction] = useState(null); // 'APPROVED' | 'REJECTED'
  const [feedback, setFeedback] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  // Increment view count on mount (once per session)
  useEffect(() => {
    if (!resource?.id) return;
    const sessionKey = `viewed_resource_${resource.id}`;
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, 'true');
      fetch(`/api/knowledge/${resource.id}/view`, { method: 'POST' }).catch(() => {});
    }
  }, [resource?.id]);

  if (!resource) return null;

  const isAuthor = currentUser && currentUser.id === resource.authorId;
  const isModeratorOrAdmin =
    currentUser && (currentUser.role === 'MODERATOR' || currentUser.role === 'ADMIN');
  const canReview = isModeratorOrAdmin && (!isAuthor || currentUser.role === 'ADMIN');
  const canEdit = isAuthor || currentUser?.role === 'ADMIN';

  const wordCount = (resource.content || '').split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const formattedDate = resource.createdAt
    ? new Date(resource.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const formattedUpdateDate = resource.updatedAt
    ? new Date(resource.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this academic resource?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/knowledge/${resource.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/knowledge');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete resource');
      }
    } catch {
      alert('Network error while deleting resource');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReview = async (decision) => {
    setIsReviewing(true);
    setReviewError(null);
    try {
      const res = await fetch(`/api/knowledge/${resource.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, feedback }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || 'Failed to submit review');
      } else {
        setReviewSuccess(`Resource successfully ${decision === 'APPROVED' ? 'approved' : 'rejected'}.`);
        setReviewAction(null);
        setTimeout(() => router.refresh(), 1000);
      }
    } catch {
      setReviewError('Network error while submitting review');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Safe paragraph renderer
  const renderFormattedContent = (content) => {
    if (!content) return null;
    const blocks = content.split('\n\n');

    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // Header 2
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="mt-8 mb-4 text-xl font-bold text-[#101B3D]">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      // Header 3
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="mt-6 mb-3 text-lg font-bold text-[#101B3D]">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      // Bullet list
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').filter(Boolean);
        return (
          <ul key={idx} className="my-4 list-disc pl-5 space-y-1.5 text-sm text-[#344568] leading-relaxed">
            {items.map((it, i) => (
              <li key={i}>{it.replace(/^[-*]\s+/, '')}</li>
            ))}
          </ul>
        );
      }
      // Code block
      if (trimmed.startsWith('```')) {
        const codeLines = trimmed.replace(/^```[a-z]*\n?/, '').replace(/```$/, '');
        return (
          <pre
            key={idx}
            className="my-5 overflow-x-auto rounded-xl bg-[#0F172A] p-4 text-xs font-mono text-[#E2E8F0] shadow-inner"
          >
            <code>{codeLines}</code>
          </pre>
        );
      }
      // Blockquote
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="my-4 border-l-4 border-[#2563EB] bg-[#EFF6FF]/60 px-4 py-3 rounded-r-xl text-xs sm:text-sm text-[#1E3A8A] italic"
          >
            {trimmed.replace(/^>\s*/, '')}
          </blockquote>
        );
      }

      // Normal paragraph
      return (
        <p key={idx} className="my-4 text-sm sm:text-base text-[#344568] leading-relaxed">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="space-y-8">
      {/* ── Top Navigation Bar ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href="/knowledge"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Knowledge Hub
        </Link>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/knowledge/${resource.id}/edit`}
              className="inline-flex items-center gap-1 rounded-xl border border-[#E5EAF2] bg-white px-3 py-1.5 text-xs font-semibold text-[#344568] hover:border-[#BFDBFE] hover:text-[#2563EB] shadow-2xs transition-colors"
            >
              <Edit3 size={13} /> Edit
            </Link>
          )}

          {canEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              <Trash2 size={13} /> Delete
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1 rounded-xl border border-[#E5EAF2] bg-white px-3 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
          >
            <Share2 size={13} /> {copied ? 'Copied!' : 'Share'}
          </button>

          <BookmarkButton
            resourceId={resource.id}
            initialBookmarked={resource.isBookmarked}
            initialCount={resource.bookmarksCount || 0}
            size="md"
          />
        </div>
      </div>

      {/* ── Status Banner (if not approved) ─────────────────────── */}
      {resource.status !== 'APPROVED' && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 ${
            resource.status === 'PENDING'
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : resource.status === 'REJECTED'
              ? 'border-red-200 bg-red-50 text-red-900'
              : 'border-slate-200 bg-slate-50 text-slate-800'
          }`}
        >
          <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-xs">
            <span className="font-bold">
              {resource.status === 'PENDING'
                ? 'Pending Academic Review: '
                : resource.status === 'REJECTED'
                ? 'Changes Requested: '
                : 'Draft Article: '}
            </span>
            <span>
              {resource.status === 'PENDING'
                ? 'This resource is awaiting review by a peer moderator or faculty admin before public publication.'
                : resource.status === 'REJECTED'
                ? 'This resource was reviewed and requires modifications before publication.'
                : 'This is a private draft visible only to you.'}
            </span>
          </div>
        </div>
      )}

      {/* ── Moderator Inline Review Box ─────────────────────────── */}
      {canReview && resource.status === 'PENDING' && (
        <div className="rounded-2xl border border-blue-200 bg-[#EFF6FF]/60 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E3A8A] flex items-center gap-1.5">
              <Award size={15} /> Academic Moderation Review
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReviewAction('APPROVED')}
                className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  reviewAction === 'APPROVED'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle size={13} /> Approve
              </button>
              <button
                type="button"
                onClick={() => setReviewAction('REJECTED')}
                className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  reviewAction === 'REJECTED'
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'border border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                <XCircle size={13} /> Request Changes
              </button>
            </div>
          </div>

          {reviewAction && (
            <div className="pt-2 border-t border-blue-100 space-y-2">
              <input
                type="text"
                placeholder={
                  reviewAction === 'APPROVED'
                    ? 'Optional positive feedback for the author...'
                    : 'Required: explain what changes are needed before approval...'
                }
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full h-9 rounded-xl border border-blue-200 bg-white px-3 text-xs text-[#101B3D] placeholder-[#94A3B8] outline-none focus:border-[#2563EB]"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewAction(null)}
                  className="px-3 py-1 text-xs text-[#64748B] hover:text-[#101B3D]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isReviewing || (reviewAction === 'REJECTED' && !feedback.trim())}
                  onClick={() => handleReview(reviewAction)}
                  className="rounded-xl bg-[#2563EB] px-4 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#1D4ED8] disabled:opacity-50"
                >
                  {isReviewing ? 'Submitting...' : 'Confirm Decision'}
                </button>
              </div>
            </div>
          )}

          {reviewError && <p className="text-xs text-red-600">{reviewError}</p>}
          {reviewSuccess && <p className="text-xs text-emerald-600">{reviewSuccess}</p>}
        </div>
      )}

      {/* ── Main Layout: Article + Sidebar ──────────────────────── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Full Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header metadata */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-bold text-[#2563EB]">
                {resource.subject}
              </span>
              {resource.topic && (
                <span className="inline-flex items-center rounded-full border border-[#E5EAF2] bg-[#F8FAFC] px-2.5 py-0.5 text-xs font-medium text-[#64748B]">
                  {resource.topic}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101B3D] leading-tight">
              {resource.title}
            </h1>

            {resource.description && (
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed italic border-l-2 border-[#CBD5E1] pl-3">
                {resource.description}
              </p>
            )}

            {/* Reading stats */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#94A3B8] pt-2 border-b border-[#F1F5F9] pb-4">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                Published {formattedDate}
              </span>
              {formattedUpdateDate && formattedUpdateDate !== formattedDate && (
                <span>• Updated {formattedUpdateDate}</span>
              )}
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {readTimeMinutes} min read
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Eye size={13} />
                {resource.views || 0} views
              </span>
            </div>
          </div>

          {/* Article Body */}
          <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 sm:p-8 shadow-2xs">
            {renderFormattedContent(resource.content)}

            {/* External Reference Link */}
            {resource.sourceUrl && (
              <div className="mt-8 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-medium">External Academic Citation:</span>
                <a
                  href={resource.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#2563EB] hover:underline"
                >
                  Visit original resource <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Author card + Related Articles */}
        <div className="space-y-6">
          {/* Author Card */}
          <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              About the Contributor
            </h3>

            <div className="flex items-center gap-3">
              {resource.author?.avatar ? (
                <img
                  src={resource.author.avatar}
                  alt={resource.author.name}
                  className="h-12 w-12 rounded-full object-cover border border-[#E5EAF2]"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-sm font-bold text-white shadow-2xs">
                  {(resource.author?.name || 'A')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-[#101B3D]">{resource.author?.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="rounded-full bg-[#F1F5F9] px-2 py-0.2 text-[0.65rem] font-semibold text-[#64748B]">
                    {resource.author?.role || 'PEER HELPER'}
                  </span>
                  <span className="text-[0.7rem] text-[#94A3B8]">
                    {resource.author?.reputation || 0} Rep
                  </span>
                </div>
              </div>
            </div>

            {resource.author?.department && (
              <p className="text-xs text-[#64748B] leading-relaxed">
                Department of {resource.author.department}
              </p>
            )}
          </div>

          {/* Related Articles Section */}
          <RelatedArticles related={related} currentSubject={resource.subject} />
        </div>
      </div>
    </div>
  );
}

