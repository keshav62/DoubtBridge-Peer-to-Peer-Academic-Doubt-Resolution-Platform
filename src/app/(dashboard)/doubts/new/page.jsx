'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, ChevronDown } from 'lucide-react';

export default function NewDoubtPage() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('MEDIUM');
  const [tags, setTags] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Doubt submitted successfully! Peer helpers will be notified.');
    window.location.href = '/doubts';
  };

  const inputCls =
    'w-full rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2.5 text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none transition-all focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10';

  const selectCls =
    'w-full rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2.5 text-sm text-[#101B3D] outline-none transition-all focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10 appearance-none cursor-pointer';

  const labelCls = 'block text-sm font-semibold text-[#344568] mb-1.5';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* ── Breadcrumb & page header ─────────────────────────── */}
      <div>
        <Link
          href="/doubts"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Doubts
        </Link>

        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#101B3D]">
          Ask a Doubt
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Describe your problem clearly and our matching algorithm will connect you with qualified peer helpers.
        </p>
      </div>

      {/* ── Form card ────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#E5EAF2] bg-white p-6 md:p-8 space-y-5"
      >
        {/* Question title */}
        <div>
          <label htmlFor="doubt-title" className={labelCls}>
            Question Title <span className="text-red-500">*</span>
          </label>
          <input
            id="doubt-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Why does quicksort degrade to O(n²) on already sorted arrays?"
            className={inputCls}
          />
        </div>

        {/* Subject + Urgency grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="doubt-subject" className={labelCls}>
              Academic Subject
            </label>
            <div className="relative">
              <select
                id="doubt-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={selectCls}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Economics">Economics</option>
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            </div>
          </div>

          <div>
            <label htmlFor="doubt-urgency" className={labelCls}>
              Urgency Level
            </label>
            <div className="relative">
              <select
                id="doubt-urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className={selectCls}
              >
                <option value="LOW">Low — Casual discussion</option>
                <option value="MEDIUM">Medium — Due this week</option>
                <option value="HIGH">High — Urgent / exam</option>
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            </div>
          </div>
        </div>

        {/* Detailed description */}
        <div>
          <label htmlFor="doubt-description" className={labelCls}>
            Detailed Explanation &amp; Attempts <span className="text-red-500">*</span>
          </label>
          <textarea
            id="doubt-description"
            required
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain where you are stuck, what you have tried so far, and what specific steps you need help understanding..."
            className="w-full rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2.5 text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none transition-all focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10 resize-y min-h-[120px]"
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="doubt-tags" className={labelCls}>
            Tags
            <span className="ml-1.5 text-xs font-normal text-[#94A3B8]">(comma-separated, optional)</span>
          </label>
          <input
            id="doubt-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="quicksort, sorting, partition, big-o"
            className={inputCls}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-[#F1F5F9]" />

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-[#1D4ED8] transition-all"
          >
            <Send size={14} />
            Publish Doubt
          </button>
          <Link
            href="/doubts"
            className="inline-flex items-center rounded-full border border-[#E5EAF2] bg-white px-6 py-2.5 text-sm font-semibold text-[#344568] hover:bg-[#F8FAFC] transition-all"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
