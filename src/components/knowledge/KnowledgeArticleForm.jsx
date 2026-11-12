'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const POPULAR_SUBJECTS = [
  'Computer Science',
  'Data Structures & Algorithms',
  'Databases',
  'Operating Systems',
  'Computer Networks',
  'React',
  'Web Development',
  'Mathematics',
  'Physics',
  'Software Engineering',
];

export default function KnowledgeArticleForm({
  initialData = null,
  isEdit = false,
}) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    subject: initialData?.subject || '',
    topic: initialData?.topic || '',
    description: initialData?.description || '',
    content: initialData?.content || '',
    sourceUrl: initialData?.sourceUrl || '',
    status: initialData?.status === 'DRAFT' ? 'DRAFT' : 'PENDING',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters';
    } else if (formData.title.trim().length > 200) {
      errs.title = 'Title cannot exceed 200 characters';
    }

    if (!formData.subject.trim()) {
      errs.subject = 'Academic subject is required';
    }

    if (formData.description && formData.description.length > 500) {
      errs.description = 'Description cannot exceed 500 characters';
    }

    if (!formData.content.trim()) {
      errs.content = 'Content body is required';
    } else if (formData.content.trim().length < 20) {
      errs.content = 'Content body must be at least 20 characters';
    }

    if (formData.sourceUrl) {
      try {
        new URL(formData.sourceUrl);
      } catch {
        errs.sourceUrl = 'Must be a valid URL (e.g. https://example.com)';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (submitStatus) => {
    const dataToSubmit = {
      ...formData,
      status: submitStatus || formData.status,
    };

    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const url = isEdit
        ? `/api/knowledge/${initialData.id}`
        : '/api/knowledge';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json.error || 'Failed to submit article');
      } else {
        const targetId = json.resource?.id || initialData?.id;
        router.push(targetId ? `/knowledge/${targetId}` : '/knowledge');
        router.refresh();
      }
    } catch {
      setServerError('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ── Breadcrumb / Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href={isEdit && initialData?.id ? `/knowledge/${initialData.id}` : '/knowledge'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </Link>
        <span className="text-xs font-semibold text-[#94A3B8]">
          {isEdit ? 'Editing Article' : 'New Academic Submission'}
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-[#101B3D]">
          {isEdit ? 'Edit Academic Resource' : 'Submit an Academic Resource'}
        </h1>
        <p className="mt-1 text-xs text-[#64748B]">
          Contribute comprehensive study notes, algorithmic breakdowns, or architecture guides to the peer community.
        </p>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* ── Form Card ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 sm:p-8 shadow-2xs space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-[#101B3D] mb-1">
            Article Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Comprehensive Guide to Graph Traversal Algorithms (BFS & DFS)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full h-10 rounded-xl border px-3 text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none transition-all ${
              errors.title
                ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                : 'border-[#E5EAF2] focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10'
            }`}
          />
          {errors.title && <p className="mt-1 text-[0.7rem] text-red-600">{errors.title}</p>}
        </div>

        {/* Subject & Topic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#101B3D] mb-1">
              Subject / Discipline <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              list="subject-suggestions"
              placeholder="e.g. Data Structures & Algorithms"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className={`w-full h-10 rounded-xl border px-3 text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none transition-all ${
                errors.subject
                  ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                  : 'border-[#E5EAF2] focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10'
              }`}
            />
            <datalist id="subject-suggestions">
              {POPULAR_SUBJECTS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            {errors.subject && <p className="mt-1 text-[0.7rem] text-red-600">{errors.subject}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101B3D] mb-1">
              Topic / Specialization <span className="text-[#94A3B8] font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Graph Theory, MVCC, Inodes"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full h-10 rounded-xl border border-[#E5EAF2] px-3 text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
            />
          </div>
        </div>

        {/* Short Summary */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[#101B3D]">
              Brief Summary <span className="text-[#94A3B8] font-normal">(For search cards)</span>
            </label>
            <span className="text-[0.65rem] text-[#94A3B8]">
              {formData.description.length}/500
            </span>
          </div>
          <textarea
            rows={2}
            placeholder="A concise 1-2 sentence overview of what students will learn from this article."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`w-full rounded-xl border p-3 text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none transition-all ${
              errors.description
                ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                : 'border-[#E5EAF2] focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-[0.7rem] text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Content Body */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[#101B3D]">
              Full Article Content <span className="text-red-500">*</span>
            </label>
            <span className="text-[0.65rem] text-[#94A3B8]">
              Supports Markdown (`## Headers`, `* Bullets`, ` ```code `)
            </span>
          </div>
          <textarea
            rows={12}
            placeholder="Write your comprehensive educational article here. Include explanations, examples, code blocks, or mathematical steps..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className={`w-full rounded-xl border p-3.5 font-sans text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none transition-all leading-relaxed ${
              errors.content
                ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                : 'border-[#E5EAF2] focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10'
            }`}
          />
          {errors.content && <p className="mt-1 text-[0.7rem] text-red-600">{errors.content}</p>}
        </div>

        {/* Source URL */}
        <div>
          <label className="block text-xs font-bold text-[#101B3D] mb-1">
            External Citation / Source URL <span className="text-[#94A3B8] font-normal">(Optional)</span>
          </label>
          <input
            type="url"
            placeholder="https://..."
            value={formData.sourceUrl}
            onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
            className={`w-full h-10 rounded-xl border px-3 text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none transition-all ${
              errors.sourceUrl
                ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                : 'border-[#E5EAF2] focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10'
            }`}
          />
          {errors.sourceUrl && (
            <p className="mt-1 text-[0.7rem] text-red-600">{errors.sourceUrl}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#F1F5F9]">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit('DRAFT')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E5EAF2] bg-white px-4 py-2.5 text-xs font-bold text-[#64748B] hover:border-[#BFDBFE] hover:text-[#2563EB] disabled:opacity-50 transition-colors"
          >
            <Save size={14} />
            Save as Draft
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('PENDING')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors"
            >
              <Send size={14} />
              {isSubmitting ? 'Submitting...' : isEdit ? 'Update & Submit for Review' : 'Submit for Academic Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

