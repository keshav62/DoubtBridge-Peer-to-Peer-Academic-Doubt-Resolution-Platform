'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  MessageSquare,
  HelpCircle,
  User,
  Award,
  BookOpen,
  ArrowUpDown,
  X,
  Send,
  Sparkles,
} from 'lucide-react';
import { timeAgo } from '@/lib/utils';

const QUEUE_TABS = [
  { id: 'all', label: 'All Answers' },
  { id: 'pending', label: 'Pending Review', badgeColor: 'bg-amber-100 text-amber-800' },
  { id: 'urgent', label: 'High Priority Doubts', badgeColor: 'bg-red-100 text-red-800' },
  { id: 'needs_changes', label: 'Needs Changes', badgeColor: 'bg-purple-100 text-purple-800' },
  { id: 'approved', label: 'Approved', badgeColor: 'bg-emerald-100 text-emerald-800' },
  { id: 'rejected', label: 'Rejected', badgeColor: 'bg-rose-100 text-rose-800' },
];

export default function AdminAnswerVerificationPage() {
  const [answers, setAnswers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeQueue, setActiveQueue] = useState('pending');
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [sort, setSort] = useState('newest');

  // Selected answer for review modal / panel
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [actionDecision, setActionDecision] = useState(null); // 'APPROVED' | 'REJECTED' | 'NEEDS_CHANGES'
  const [feedback, setFeedback] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', message }

  const searchDebounceRef = useRef(null);

  const fetchAnswers = useCallback(
    async (pageToLoad = 1, isManual = false) => {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(pageToLoad),
          limit: '10',
          queue: activeQueue,
          sort,
        });

        if (subject && subject !== 'All') params.set('subject', subject);
        if (search.trim()) params.set('search', search.trim());

        const res = await fetch(`/api/admin/answers?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setAnswers(data.answers);
          setPagination(data.pagination);
        } else {
          showNotification('error', data.error || 'Failed to fetch answers.');
        }
      } catch (err) {
        showNotification('error', 'Network error loading answers queue.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeQueue, sort, subject, search]
  );

  useEffect(() => {
    fetchAnswers(1);
  }, [fetchAnswers]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchAnswers(1);
    }, 350);
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const openReviewModal = async (ans) => {
    setSelectedAnswer(ans);
    setActionDecision(null);
    setFeedback('');
    setReviewLoading(true);

    try {
      const res = await fetch(`/api/admin/answers/${ans.id}`);
      const data = await res.json();
      if (data.success && data.answer) {
        setSelectedAnswer(data.answer);
      }
    } catch {
      // fallback to shallow answer
    } finally {
      setReviewLoading(false);
    }
  };

  const handleModerateSubmit = async (e) => {
    e?.preventDefault();
    if (!actionDecision || !selectedAnswer) return;

    if ((actionDecision === 'REJECTED' || actionDecision === 'NEEDS_CHANGES') && feedback.trim().length < 5) {
      showNotification('error', 'Please provide a feedback message of at least 5 characters.');
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/admin/answers/${selectedAnswer.id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: actionDecision,
          feedback: feedback.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotification('success', data.message || 'Moderation decision saved.');
        setSelectedAnswer(null);
        fetchAnswers(pagination.page);
      } else {
        showNotification('error', data.error || 'Failed to submit decision.');
      }
    } catch {
      showNotification('error', 'An error occurred while submitting decision.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusBadge = (ans) => {
    const hasNeedsChanges = ans.reviews?.some((r) => r.decision === 'NEEDS_CHANGES');
    if (ans.status === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
          <CheckCircle2 size={12} /> Approved
        </span>
      );
    }
    if (ans.status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-bold text-rose-700">
          <XCircle size={12} /> Rejected
        </span>
      );
    }
    if (hasNeedsChanges) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-xs font-bold text-purple-700">
          <AlertCircle size={12} /> Needs Changes
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700">
        <Clock size={12} /> Pending Review
      </span>
    );
  };

  const subjectsList = [
    'All',
    'Mathematics',
    'Physics',
    'Computer Science',
    'Chemistry',
    'Biology',
    'Engineering',
    'General',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg transition-all ${
            notification.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-rose-200 bg-rose-50 text-rose-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
          )}
          <span className="text-xs font-semibold">{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="ml-2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-[#101B3D]">
              Answer Verification &amp; Moderation Center
            </h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#2563EB] border border-blue-200/60">
              Admin &amp; Moderator
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Audit, verify, and moderate helper answers before they are accepted as academic solutions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/moderation"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2 text-xs font-semibold text-[#101B3D] hover:bg-[#F8FAFC] transition-colors"
          >
            Moderation Analytics <ExternalLink size={13} />
          </Link>
          <button
            type="button"
            onClick={() => fetchAnswers(pagination.page, true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Queue Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-[#E5EAF2] pb-2">
        {QUEUE_TABS.map((tab) => {
          const isActive = activeQueue === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveQueue(tab.id);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white border border-[#E5EAF2] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#101B3D]'
              }`}
            >
              {tab.label}
              {tab.badgeColor && !isActive && (
                <span className={`rounded-full px-1.5 py-0.2 text-[0.65rem] ${tab.badgeColor}`}>
                  Active
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search answers, helpers, or doubt titles..."
            className="w-full rounded-xl border border-[#E5EAF2] bg-white pl-9 pr-3.5 py-2 text-xs text-[#101B3D] placeholder-[#94A3B8] focus:border-[#2563EB] focus:outline-hidden"
          />
        </div>

        {/* Subject Filter */}
        <div className="relative">
          <select
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2 text-xs text-[#101B3D] focus:border-[#2563EB] focus:outline-hidden"
          >
            <option value="">Filter by Subject (All)</option>
            {subjectsList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2 text-xs text-[#101B3D] focus:border-[#2563EB] focus:outline-hidden"
          >
            <option value="newest">Sort by Newest Submissions</option>
            <option value="oldest">Sort by Oldest Submissions</option>
          </select>
        </div>
      </div>

      {/* Answers Table */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 w-full rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : answers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-[#94A3B8] mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-sm font-bold text-[#101B3D]">No answers in this queue</h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
              There are currently no answers matching the selected queue filter and search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E5EAF2] text-[#64748B] font-semibold">
                <tr>
                  <th className="px-4 py-3">Answer ID</th>
                  <th className="px-4 py-3">Doubt Title &amp; Subject</th>
                  <th className="px-4 py-3">Answer Preview</th>
                  <th className="px-4 py-3">Helper</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF2]">
                {answers.map((ans) => (
                  <tr key={ans.id} className="hover:bg-[#F8FAFC]/70 transition-colors">
                    {/* ID */}
                    <td className="px-4 py-3.5 font-mono text-[0.7rem] text-[#94A3B8]">
                      {ans.id.slice(0, 8)}...
                    </td>

                    {/* Doubt */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-[#101B3D] truncate block max-w-[200px]">
                          {ans.doubt?.title}
                        </span>
                        {ans.doubt?.priority === 'HIGH' || ans.doubt?.priority === 'URGENT' ? (
                          <span className="rounded-md bg-rose-50 px-1.5 py-0.2 text-[0.65rem] font-bold text-rose-600 border border-rose-200">
                            {ans.doubt.priority}
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[0.65rem] text-[#64748B] font-medium">
                        {ans.doubt?.subject || 'General'}
                      </span>
                    </td>

                    {/* Answer Preview */}
                    <td className="px-4 py-3.5 max-w-sm">
                      <p className="text-xs text-[#344568] line-clamp-2 leading-relaxed italic">
                        &quot;{ans.content}&quot;
                      </p>
                    </td>

                    {/* Helper */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[#2563EB] font-bold text-[0.65rem]">
                          {ans.author?.name ? ans.author.name.slice(0, 2).toUpperCase() : 'HP'}
                        </div>
                        <div>
                          <p className="font-bold text-[#101B3D]">{ans.author?.name || 'Peer Helper'}</p>
                          <p className="text-[0.65rem] text-[#64748B]">
                            {ans.author?.reputation ?? 0} rep • {ans.author?.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Submitted */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-[#64748B]">
                      {timeAgo(ans.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusBadge(ans)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openReviewModal(ans)}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors"
                      >
                        Inspect &amp; Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E5EAF2] bg-[#F8FAFC] px-4 py-3">
            <span className="text-xs text-[#64748B]">
              Showing page <span className="font-bold text-[#101B3D]">{pagination.page}</span> of{' '}
              <span className="font-bold text-[#101B3D]">{pagination.totalPages}</span> ({pagination.total} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchAnswers(pagination.page - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAF2] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#101B3D] hover:bg-[#F8FAFC] disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchAnswers(pagination.page + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAF2] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#101B3D] hover:bg-[#F8FAFC] disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* REVIEW & VERIFICATION MODAL / DETAIL PANEL                                */}
      {/* ========================================================================= */}
      {selectedAnswer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl border border-[#E5EAF2] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E5EAF2] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black tracking-tight text-[#101B3D]">
                    Answer Verification Detail
                  </h2>
                  {getStatusBadge(selectedAnswer)}
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Answer ID: <span className="font-mono">{selectedAnswer.id}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAnswer(null)}
                className="rounded-xl border border-[#E5EAF2] p-1.5 text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* 1. Original Doubt Context */}
            <div className="rounded-2xl border border-[#E5EAF2] bg-[#F8FAFC] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-[#2563EB]">
                    <HelpCircle size={14} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Original Academic Doubt
                  </span>
                </div>
                <Link
                  href={`/doubts/${selectedAnswer.doubtId}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-[#2563EB] hover:underline"
                >
                  Open Doubt Page <ExternalLink size={11} />
                </Link>
              </div>

              <h3 className="text-sm font-bold text-[#101B3D]">
                {selectedAnswer.doubt?.title}
              </h3>
              <p className="text-xs text-[#475569] whitespace-pre-wrap leading-relaxed">
                {selectedAnswer.doubt?.description}
              </p>

              <div className="flex items-center gap-2 pt-2 text-[0.7rem] text-[#64748B] flex-wrap">
                <span className="rounded-md bg-blue-50 px-2 py-0.5 font-bold text-[#2563EB]">
                  {selectedAnswer.doubt?.subject || 'General'}
                </span>
                {selectedAnswer.doubt?.topic && (
                  <span className="rounded-md bg-slate-200 px-2 py-0.5 font-semibold text-slate-700">
                    {selectedAnswer.doubt.topic}
                  </span>
                )}
                <span>
                  Asked by {selectedAnswer.doubt?.student?.name || 'Student'} (
                  {selectedAnswer.doubt?.student?.department || 'Department'})
                </span>
              </div>
            </div>

            {/* 2. Helper Profile & Statistics */}
            <div className="rounded-2xl border border-[#E5EAF2] bg-white p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <User size={14} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Helper Information
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="rounded-xl border border-[#E5EAF2] p-2.5">
                  <p className="text-[0.65rem] text-[#64748B] uppercase font-bold">Helper Name</p>
                  <p className="text-xs font-bold text-[#101B3D] mt-0.5">
                    {selectedAnswer.author?.name || 'Helper'}
                  </p>
                  <p className="text-[0.65rem] text-[#94A3B8]">{selectedAnswer.author?.role}</p>
                </div>

                <div className="rounded-xl border border-[#E5EAF2] p-2.5">
                  <p className="text-[0.65rem] text-[#64748B] uppercase font-bold">Peer Reputation</p>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">
                    {selectedAnswer.author?.reputation ?? 0} points
                  </p>
                  <p className="text-[0.65rem] text-[#94A3B8]">
                    {selectedAnswer.author?.helperProfile?.acceptedAnswers ?? 0} accepted solutions
                  </p>
                </div>

                <div className="rounded-xl border border-[#E5EAF2] p-2.5">
                  <p className="text-[0.65rem] text-[#64748B] uppercase font-bold">Qualified Subjects</p>
                  <p className="text-xs font-bold text-[#101B3D] mt-0.5 truncate">
                    {selectedAnswer.author?.helperProfile?.subjects || selectedAnswer.author?.department || 'General'}
                  </p>
                  <p className="text-[0.65rem] text-[#94A3B8]">
                    {selectedAnswer.author?.helperProfile?.totalAnswers ?? 0} total answers
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Submitted Answer Content */}
            <div className="rounded-2xl border border-[#2563EB]/30 bg-blue-50/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-[#2563EB]">
                    <MessageSquare size={14} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                    Submitted Answer Body
                  </span>
                </div>
                <span className="text-[0.7rem] text-[#64748B]">
                  Submitted {timeAgo(selectedAnswer.createdAt)}
                </span>
              </div>

              <div className="rounded-xl border border-[#E5EAF2] bg-white p-4 font-normal text-xs text-[#101B3D] leading-relaxed whitespace-pre-wrap">
                {selectedAnswer.content}
              </div>
            </div>

            {/* 4. Moderation History */}
            {selectedAnswer.reviews && selectedAnswer.reviews.length > 0 && (
              <div className="rounded-2xl border border-[#E5EAF2] p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Prior Moderation Decisions ({selectedAnswer.reviews.length})
                </h4>
                <div className="divide-y divide-[#E5EAF2]">
                  {selectedAnswer.reviews.map((rev) => (
                    <div key={rev.id} className="py-2 text-xs flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#101B3D]">
                          {rev.decision} by {rev.reviewer?.name} ({rev.reviewer?.role})
                        </span>
                        <span className="text-[0.65rem] text-[#94A3B8]">
                          {timeAgo(rev.reviewedAt)}
                        </span>
                      </div>
                      {rev.feedback && (
                        <p className="text-[0.7rem] text-[#64748B] italic">
                          Feedback: &quot;{rev.feedback}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Moderation Action Form */}
            <div className="rounded-2xl border-2 border-[#E5EAF2] bg-[#F8FAFC] p-5 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#101B3D]">
                Choose Moderation Decision
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setActionDecision('APPROVED')}
                  className={`flex flex-col items-center justify-center gap-1 rounded-2xl border-2 p-3 transition-all ${
                    actionDecision === 'APPROVED'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                      : 'border-[#E5EAF2] bg-white text-[#344568] hover:border-emerald-300'
                  }`}
                >
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  <span className="text-xs font-bold">Approve Answer</span>
                  <span className="text-[0.65rem] text-[#64748B]">Publish as valid solution</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActionDecision('NEEDS_CHANGES')}
                  className={`flex flex-col items-center justify-center gap-1 rounded-2xl border-2 p-3 transition-all ${
                    actionDecision === 'NEEDS_CHANGES'
                      ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                      : 'border-[#E5EAF2] bg-white text-[#344568] hover:border-purple-300'
                  }`}
                >
                  <AlertCircle size={20} className="text-purple-600" />
                  <span className="text-xs font-bold">Request Changes</span>
                  <span className="text-[0.65rem] text-[#64748B]">Guidance for revision</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActionDecision('REJECTED')}
                  className={`flex flex-col items-center justify-center gap-1 rounded-2xl border-2 p-3 transition-all ${
                    actionDecision === 'REJECTED'
                      ? 'border-rose-600 bg-rose-50 text-rose-900 shadow-sm'
                      : 'border-[#E5EAF2] bg-white text-[#344568] hover:border-rose-300'
                  }`}
                >
                  <XCircle size={20} className="text-rose-600" />
                  <span className="text-xs font-bold">Reject Answer</span>
                  <span className="text-[0.65rem] text-[#64748B]">Decline from platform</span>
                </button>
              </div>

              {/* Feedback Textarea */}
              {actionDecision && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-[#101B3D]">
                    {actionDecision === 'APPROVED'
                      ? 'Optional Approval Note:'
                      : actionDecision === 'NEEDS_CHANGES'
                      ? 'Required Constructive Feedback (min 5 chars):'
                      : 'Required Rejection Reason (min 5 chars):'}
                  </label>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={
                      actionDecision === 'APPROVED'
                        ? 'Good academic explanation with steps...'
                        : actionDecision === 'NEEDS_CHANGES'
                        ? 'Please clarify formula step 2 and add unit dimensions...'
                        : 'Answer does not meet academic guidelines or includes promotional content...'
                    }
                    className="w-full rounded-xl border border-[#E5EAF2] bg-white p-3 text-xs text-[#101B3D] placeholder-[#94A3B8] focus:border-[#2563EB] focus:outline-hidden"
                  />
                  <p className="text-[0.65rem] text-[#64748B]">
                    Feedback is automatically sent via notification to the helper upon submission.
                  </p>
                </div>
              )}

              {/* Submit Action Button */}
              {actionDecision && (
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5EAF2]">
                  <button
                    type="button"
                    onClick={() => {
                      setActionDecision(null);
                      setFeedback('');
                    }}
                    className="rounded-xl border border-[#E5EAF2] bg-white px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleModerateSubmit}
                    disabled={submittingAction}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 ${
                      actionDecision === 'APPROVED'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : actionDecision === 'NEEDS_CHANGES'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    <Send size={13} className={submittingAction ? 'animate-spin' : ''} />
                    {submittingAction
                      ? 'Saving Decision...'
                      : `Confirm ${actionDecision === 'APPROVED' ? 'Approval' : actionDecision === 'NEEDS_CHANGES' ? 'Changes Request' : 'Rejection'}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
