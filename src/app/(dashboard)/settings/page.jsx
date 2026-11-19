'use client';

import { useState, useEffect } from 'react';
import { User, Bell, Shield, LogOut, RefreshCw, AlertCircle, BookOpen } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [availability, setAvailability] = useState(false);
  const [subjects, setSubjects] = useState('');
  const [subjectsError, setSubjectsError] = useState('');
  const [subjectsSuccess, setSubjectsSuccess] = useState('');

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          setAvailability(data.user?.isAvailable || false);
          setSubjects(data.user?.subjects || '');
        }
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleToggleAvailability = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/helpers/availability', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setAvailability(data.isAvailable);
        setUser((prev) => ({ ...prev, isAvailable: data.isAvailable }));
      } else {
        setError(data.error || 'Failed to update availability');
      }
    } catch (err) {
      setError('Failed to update availability');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSubjects = async () => {
    setSubjectsError('');
    setSubjectsSuccess('');
    setIsSaving(true);

    const subjectsList = subjects
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (subjectsList.length === 0) {
      setSubjectsError('At least one subject is required');
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/helpers/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects: subjectsList }),
      });
      const data = await response.json();
      if (data.success) {
        setSubjectsSuccess('Subjects updated successfully');
        setUser((prev) => ({ ...prev, subjects: subjects.join(', ') }));
      } else {
        setSubjectsError(data.error || 'Failed to update subjects');
      }
    } catch (err) {
      setSubjectsError('Failed to update subjects');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-64 rounded-2xl border border-[#E5EAF2] bg-white p-6 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ── Header ───────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#101B3D]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Manage your account preferences, profile, and notification settings.
        </p>
      </div>

      {/* ── Error Banner ─────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Profile Section ─────────────────────────────────── */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#101B3D]">Profile Information</h2>
            <p className="text-xs text-[#64748B]">Your basic account details</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Name</label>
            <p className="text-sm text-[#101B3D]">{user?.name || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Email</label>
            <p className="text-sm text-[#101B3D]">{user?.email || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Role</label>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]">
              {user?.role || 'STUDENT'}
            </span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Reputation</label>
            <p className="text-sm text-[#101B3D]">{user?.reputation || 0} points</p>
          </div>
        </div>
      </div>

      {/* ── Helper Settings (for HELPER role) ─────────────────── */}
      {user?.role === 'HELPER' && (
        <>
          <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#10B981]">
                <RefreshCw size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#101B3D]">Availability Status</h2>
                <p className="text-xs text-[#64748B]">Control when you appear as available to help</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#101B3D] mb-1">
                  {availability ? 'Available for doubts' : 'Busy - not accepting new doubts'}
                </p>
                <p className="text-xs text-[#64748B]">
                  {availability
                    ? 'Students can see you in the helper directory'
                    : 'You will not appear in search results'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleAvailability}
                disabled={isSaving}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  availability
                    ? 'bg-[#10B981] text-white hover:bg-[#059669]'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                } disabled:opacity-50`}
              >
                {isSaving ? 'Updating...' : availability ? 'Set Busy' : 'Set Available'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDE9FE] text-violet-600">
                <BookOpen size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#101B3D]">Teaching Subjects</h2>
                <p className="text-xs text-[#64748B]">Subjects you can help students with</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                  Subjects (comma-separated)
                </label>
                <input
                  type="text"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="e.g., Mathematics, Physics, Chemistry"
                  className="w-full rounded-xl border border-[#E5EAF2] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#101B3D] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
                <p className="text-xs text-[#64748B] mt-1">
                  Enter subjects separated by commas
                </p>
              </div>

              {subjectsError && (
                <p className="text-xs text-red-600">{subjectsError}</p>
              )}

              {subjectsSuccess && (
                <p className="text-xs text-[#10B981]">{subjectsSuccess}</p>
              )}

              <button
                type="button"
                onClick={handleSaveSubjects}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Subjects'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Notifications Section ─────────────────────────────── */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#101B3D]">Notification Preferences</h2>
            <p className="text-xs text-[#64748B]">Manage how you receive updates</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-[#101B3D]">Email Notifications</p>
              <p className="text-xs text-[#64748B]">Receive updates via email</p>
            </div>
            <button
              type="button"
              className="w-12 h-6 rounded-full bg-[#E5EAF2] relative transition-colors"
              aria-pressed="false"
            >
              <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform" />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-[#101B3D]">Doubt Updates</p>
              <p className="text-xs text-[#64748B]">Notifications when doubts are answered</p>
            </div>
            <button
              type="button"
              className="w-12 h-6 rounded-full bg-[#2563EB] relative transition-colors"
              aria-pressed="true"
            >
              <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform translate-x-6" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Account Actions ───────────────────────────────────── */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <LogOut size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#101B3D]">Account Actions</h2>
            <p className="text-xs text-[#64748B]">Sign out or manage your session</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => (window.location.href = '/logout')}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-all"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
