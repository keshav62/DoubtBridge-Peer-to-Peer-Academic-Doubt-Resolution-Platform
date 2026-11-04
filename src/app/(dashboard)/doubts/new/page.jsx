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
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    setMessage('');
    setSaving(true);

    try {
      const response = await fetch('/api/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, subject, description, urgency, tags }),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.errors || {});
        throw new Error(result.error || 'Please check the form and try again.');
      }
      window.location.href = `/doubts/${result.doubt.id}`;
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2.5 text-sm text-[#101B3D] outline-none focus:border-[#2563EB]/50';
  const labelCls = 'mb-1.5 block text-sm font-semibold text-[#344568]';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/doubts" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#2563EB]"><ArrowLeft size={14} /> Back to Doubts</Link>
        <h1 className="mt-3 text-2xl font-extrabold text-[#101B3D]">Ask a Doubt</h1>
        <p className="mt-1 text-sm text-[#64748B]">Explain your question clearly so other students can help.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[#E5EAF2] bg-white p-6 md:p-8">
        {message && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p>}
        <div>
          <label htmlFor="doubt-title" className={labelCls}>Question Title *</label>
          <input id="doubt-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} required placeholder="Enter a short title for your question" className={inputCls} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="doubt-subject" className={labelCls}>Academic Subject *</label>
            <div className="relative">
              <select id="doubt-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={`${inputCls} appearance-none pr-9`}>
                <option value="Computer Science">Computer Science</option><option value="Mathematics">Mathematics</option><option value="Physics">Physics</option><option value="Chemistry">Chemistry</option><option value="Economics">Economics</option>
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            </div>
            {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
          </div>
          <div>
            <label htmlFor="doubt-urgency" className={labelCls}>Urgency</label>
            <div className="relative">
              <select id="doubt-urgency" value={urgency} onChange={(e) => setUrgency(e.target.value)} className={`${inputCls} appearance-none pr-9`}>
                <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="doubt-description" className={labelCls}>Detailed Description *</label>
          <textarea id="doubt-description" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} required placeholder="Explain what you tried and where you got stuck..." className={`${inputCls} resize-y`} />
          <div className="mt-1 flex justify-between"><span className="text-xs text-red-600">{errors.description || ''}</span><span className="text-xs text-[#94A3B8]">{description.length}/5000</span></div>
        </div>

        <div>
          <label htmlFor="doubt-tags" className={labelCls}>Topic Tags <span className="font-normal text-[#94A3B8]">(optional, comma-separated)</span></label>
          <input id="doubt-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="arrays, sorting, Java" className={inputCls} />
        </div>

        <div className="flex flex-wrap gap-3 border-t border-[#F1F5F9] pt-5">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60"><Send size={14} />{saving ? 'Submitting...' : 'Publish Doubt'}</button>
          <Link href="/doubts" className="rounded-full border border-[#E5EAF2] px-6 py-2.5 text-sm font-semibold text-[#344568]">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
