'use client';

import { useState } from 'react';
import { X, Check, BookOpen, ShieldCheck, AlertCircle } from 'lucide-react';

const COMMON_SUBJECTS = [
  'Computer Science',
  'Data Structures',
  'Algorithms',
  'Databases',
  'Operating Systems',
  'Computer Networks',
  'React',
  'JavaScript',
  'Mathematics',
  'Linear Algebra',
  'Calculus',
  'Physics',
  'Economics',
];

export default function HelperProfileForm({
  initialData = {},
  isOpen = false,
  onClose,
  onSave,
  isSaving = false,
}) {
  const [bio, setBio] = useState(initialData.bio || '');
  const [subjects, setSubjects] = useState(initialData.subjects || '');
  const [expertise, setExpertise] = useState(initialData.expertise || '');
  const [isAvailable, setIsAvailable] = useState(initialData.isAvailable ?? true);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const currentSubjects = subjects
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const toggleSubject = (sub) => {
    if (currentSubjects.includes(sub)) {
      setSubjects(currentSubjects.filter((s) => s !== sub).join(', '));
    } else {
      setSubjects([...currentSubjects, sub].join(', '));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!subjects.trim()) {
      setError('Please add at least one subject of expertise.');
      return;
    }

    try {
      await onSave({
        bio: bio.trim(),
        subjects: subjects.trim(),
        expertise: expertise.trim(),
        isAvailable,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E5EAF2] pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#101B3D]">
              {initialData.hasProfile ? 'Edit Helper Profile & Expertise' : 'Activate Peer Helper Profile'}
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Specify your academic strengths so students and the matching engine find you.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Availability Checkbox */}
          <div className="flex items-center justify-between rounded-xl border border-[#E5EAF2] bg-[#FAFBFD] p-3.5">
            <div>
              <p className="font-bold text-[#101B3D]">Accepting New Assignments</p>
              <p className="text-[#64748B] text-[0.7rem] mt-0.5">
                When enabled, you appear in student searches and receive matched recommendations.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]" />
            </label>
          </div>

          {/* Quick Subject Tag Pills */}
          <div>
            <label className="block font-bold text-[#344568] mb-1.5">
              Quick Select Academic Disciplines:
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_SUBJECTS.map((sub) => {
                const isSelected = currentSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSubject(sub)}
                    className={`rounded-lg px-2.5 py-1 text-[0.7rem] font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-[#F1F5F9] text-[#475569] hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check size={10} className="inline mr-1" />}
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subjects input */}
          <div>
            <label className="block font-bold text-[#344568] mb-1">
              All Subjects (Comma-separated) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              placeholder="e.g. Data Structures, Algorithms, Computer Networks"
              className="w-full rounded-xl border border-[#E5EAF2] p-2.5 text-xs text-[#101B3D] focus:border-[#2563EB] focus:outline-none"
              required
            />
          </div>

          {/* Topics & Expertise */}
          <div>
            <label className="block font-bold text-[#344568] mb-1">
              Specific Topics & Keywords (Comma-separated)
            </label>
            <input
              type="text"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="e.g. Graph Traversal, Dynamic Programming, SQL Indexing, React Hooks"
              className="w-full rounded-xl border border-[#E5EAF2] p-2.5 text-xs text-[#101B3D] focus:border-[#2563EB] focus:outline-none"
            />
            <p className="text-[0.68rem] text-[#94A3B8] mt-1">
              Matching a question's specific topic adds +50 match score points!
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block font-bold text-[#344568] mb-1">
              Short Biography / Academic Background
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell students about your coursework, research, or what topics you love explaining..."
              className="w-full rounded-xl border border-[#E5EAF2] p-2.5 text-xs text-[#101B3D] focus:border-[#2563EB] focus:outline-none"
              maxLength={1000}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5EAF2]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#E5EAF2] px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1D4ED8] disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

