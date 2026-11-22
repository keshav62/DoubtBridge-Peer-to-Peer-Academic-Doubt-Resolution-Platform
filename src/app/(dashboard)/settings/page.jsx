'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  GraduationCap,
  BookOpen,
  Lock,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  RefreshCw,
  Bell,
  Eye,
  EyeOff,
  Save,
  Award,
  Sparkles,
} from 'lucide-react';

function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Contains a letter', ok: /[A-Za-z]/.test(password) },
    { label: 'Contains a number', ok: /[0-9]/.test(password) },
  ];
  return (
    <ul className="mt-2 space-y-1">
      {checks.map((c) => (
        <li
          key={c.label}
          className={`flex items-center gap-1.5 text-xs ${c.ok ? 'text-emerald-600' : 'text-[#94A3B8]'}`}
        >
          <CheckCircle2 size={12} className={c.ok ? 'text-emerald-500' : 'text-[#CBD5E1]'} />
          {c.label}
        </li>
      ))}
    </ul>
  );
}

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getRoleBadgeColor(role) {
  switch (role) {
    case 'ADMIN':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'MODERATOR':
      return 'border-purple-200 bg-purple-50 text-purple-700';
    case 'HELPER':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'STUDENT':
    default:
      return 'border-blue-200 bg-blue-50 text-[#2563EB]';
  }
}

export default function SettingsPage() {
  const router = useRouter();

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // User Profile Data
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    academicYear: '',
    bio: '',
  });

  // Action Pending States
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Helper Specific State
  const [availability, setAvailability] = useState(true);
  const [subjects, setSubjects] = useState('');
  const [savingHelper, setSavingHelper] = useState(false);
  const [helperSuccess, setHelperSuccess] = useState('');
  const [helperError, setHelperError] = useState('');

  // Security / Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Notification Preferences State (Client Toggles)
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    doubtAnswers: true,
    moderationAlerts: true,
  });

  const departmentsList = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Mathematics & Computing',
    'Physics & Applied Sciences',
    'Business & Economics',
    'Humanities & Social Sciences',
    'Other / General Studies',
  ];

  const academicYearsList = [
    '1st Year (Freshman)',
    '2nd Year (Sophomore)',
    '3rd Year (Junior)',
    '4th Year (Senior)',
    'Graduate / Master’s',
    'PhD / Faculty',
  ];

  // Fetch Authenticated User
  const fetchUserProfile = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const res = await fetch('/api/auth/me');

      if (res.status === 401) {
        window.location.href = '/login?callbackUrl=/settings';
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFetchError(data.error || 'Failed to load user profile information.');
        return;
      }

      const u = data.user;
      setUser(u);
      setForm({
        name: u.name || '',
        email: u.email || '',
        department: u.department || '',
        academicYear: u.academicYear || '',
        bio: u.bio || '',
      });
      setAvailability(u.isAvailable ?? true);
      setSubjects(u.subjects || '');
    } catch {
      setFetchError('A network error occurred while loading profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!form.name.trim() || form.name.trim().length < 2) {
      setProfileError('Full name must be at least 2 characters long.');
      return;
    }

    setSavingProfile(true);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          department: form.department.trim() || null,
          academicYear: form.academicYear.trim() || null,
          bio: form.bio.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setProfileError(data.error || 'Failed to update profile.');
        return;
      }

      setUser(data.user);
      setProfileSuccess('Your profile information has been saved successfully.');
      setTimeout(() => setProfileSuccess(''), 5000);
    } catch {
      setProfileError('A network error occurred while saving profile changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Toggle Helper Availability
  const handleToggleAvailability = async () => {
    setHelperSuccess('');
    setHelperError('');
    setSavingHelper(true);

    const nextState = !availability;

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: nextState }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setHelperError(data.error || 'Failed to update availability status.');
        return;
      }

      setAvailability(nextState);
      setUser(data.user);
      setHelperSuccess(
        nextState
          ? 'You are now marked as Available to accept academic doubts.'
          : 'You are now marked as Busy / Offline.'
      );
      setTimeout(() => setHelperSuccess(''), 4000);
    } catch {
      setHelperError('Network error updating availability.');
    } finally {
      setSavingHelper(false);
    }
  };

  // Save Helper Subjects
  const handleSaveSubjects = async () => {
    setHelperSuccess('');
    setHelperError('');
    setSavingHelper(true);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects: subjects.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setHelperError(data.error || 'Failed to update subjects.');
        return;
      }

      setUser(data.user);
      setHelperSuccess('Teaching subjects updated successfully.');
      setTimeout(() => setHelperSuccess(''), 4000);
    } catch {
      setHelperError('Network error saving subjects.');
    } finally {
      setSavingHelper(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError('New password must contain at least one letter and one number.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setPasswordError(data.error || 'Failed to change password.');
        return;
      }

      setPasswordSuccess('Password has been changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch {
      setPasswordError('A network error occurred while updating password.');
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Continue to redirect even if network glitch occurs
    }
    window.location.href = '/login';
  };

  // ── Loading Skeleton ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl animate-pulse">
        <div>
          <div className="h-8 w-48 rounded-lg bg-slate-200 mb-2" />
          <div className="h-4 w-96 rounded-lg bg-slate-200" />
        </div>

        {/* Profile Card Skeleton */}
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-5 w-40 rounded bg-slate-200" />
              <div className="h-4 w-28 rounded bg-slate-200" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="h-10 rounded-xl bg-slate-200" />
            <div className="h-10 rounded-xl bg-slate-200" />
            <div className="h-10 rounded-xl bg-slate-200" />
            <div className="h-10 rounded-xl bg-slate-200" />
          </div>
          <div className="h-20 rounded-xl bg-slate-200" />
        </div>

        {/* Security Skeleton */}
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 space-y-4">
          <div className="h-6 w-36 rounded bg-slate-200" />
          <div className="h-10 w-full rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  const isHelperOrAdmin = user?.role === 'HELPER' || user?.role === 'ADMIN';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#101B3D]">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Manage your personal details, academic role preferences, and account security.
        </p>
      </div>

      {/* ── Global Fetch Error Banner ────────────────────────────── */}
      {fetchError && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span>{fetchError}</span>
          </div>
          <button
            type="button"
            onClick={fetchUserProfile}
            className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1 text-xs font-bold text-red-800 hover:bg-red-200 transition-colors"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      )}

      {/* ── Profile Information Card ────────────────────────────── */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs">
        {/* Card Header & Avatar Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-lg font-extrabold tracking-wider text-white shadow-sm shadow-blue-500/20">
              {getInitials(user?.name)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-[#101B3D]">{user?.name || 'Academic User'}</h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold border ${getRoleBadgeColor(
                    user?.role
                  )}`}
                >
                  <Shield size={12} />
                  {user?.role || 'STUDENT'}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-1.5 text-xs font-bold text-amber-800">
              <Award size={15} className="text-amber-600" />
              <span>{user?.reputation ?? 0} Reputation Points</span>
            </div>
          </div>
        </div>

        {/* Profile Success / Error Alerts */}
        {profileSuccess && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-semibold text-red-700">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSaveProfile} className="mt-6 space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label htmlFor="settings-name" className="block text-xs font-bold text-[#344568] mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  id="settings-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  disabled={savingProfile}
                  className="h-11 w-full rounded-xl border border-[#E5EAF2] bg-[#F8FAFC] pl-9 pr-3.5 text-sm text-[#101B3D] outline-none transition-all focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Academic Email (Read-Only) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="settings-email" className="block text-xs font-bold text-[#344568]">
                  Academic Email
                </label>
                <span className="text-[0.68rem] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                  Verified
                </span>
              </div>
              <div className="relative">
                <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  id="settings-email"
                  type="email"
                  readOnly
                  disabled
                  value={form.email}
                  className="h-11 w-full rounded-xl border border-[#E5EAF2] bg-slate-100/70 pl-9 pr-3.5 text-sm text-[#64748B] outline-none cursor-not-allowed select-none"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label htmlFor="settings-dept" className="block text-xs font-bold text-[#344568] mb-1.5">
                Department
              </label>
              <div className="relative">
                <BookOpen size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  id="settings-dept"
                  type="text"
                  list="departments-options"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="e.g. Computer Science"
                  disabled={savingProfile}
                  className="h-11 w-full rounded-xl border border-[#E5EAF2] bg-[#F8FAFC] pl-9 pr-3.5 text-sm text-[#101B3D] outline-none transition-all focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10 disabled:opacity-60"
                />
                <datalist id="departments-options">
                  {departmentsList.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Academic Year */}
            <div>
              <label htmlFor="settings-year" className="block text-xs font-bold text-[#344568] mb-1.5">
                Academic Year
              </label>
              <div className="relative">
                <GraduationCap size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  id="settings-year"
                  type="text"
                  list="academic-years-options"
                  value={form.academicYear}
                  onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                  placeholder="e.g. 3rd Year"
                  disabled={savingProfile}
                  className="h-11 w-full rounded-xl border border-[#E5EAF2] bg-[#F8FAFC] pl-9 pr-3.5 text-sm text-[#101B3D] outline-none transition-all focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10 disabled:opacity-60"
                />
                <datalist id="academic-years-options">
                  {academicYearsList.map((y) => (
                    <option key={y} value={y} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Academic Bio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="settings-bio" className="block text-xs font-bold text-[#344568]">
                About / Academic Bio
              </label>
              <span className="text-[0.68rem] text-[#94A3B8]">
                {form.bio.length} / 500 characters
              </span>
            </div>
            <textarea
              id="settings-bio"
              rows={3}
              maxLength={500}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell peers and helpers about your academic interests, focus areas, or goals..."
              disabled={savingProfile}
              className="w-full rounded-xl border border-[#E5EAF2] bg-[#F8FAFC] p-3 text-sm text-[#101B3D] outline-none transition-all focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10 disabled:opacity-60"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-bold text-white shadow-xs shadow-blue-500/20 hover:bg-[#1D4ED8] transition-all disabled:opacity-50 cursor-pointer"
            >
              {savingProfile ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving Changes…
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Profile Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Helper Preferences (Rendered for Helpers and Admins) ─── */}
      {isHelperOrAdmin && (
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#F1F5F9]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#10B981]">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#101B3D]">Peer Helper &amp; Teaching Preferences</h2>
              <p className="text-xs text-[#64748B]">Manage your availability status and qualified subjects</p>
            </div>
          </div>

          {helperSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{helperSuccess}</span>
            </div>
          )}

          {helperError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-semibold text-red-700">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <span>{helperError}</span>
            </div>
          )}

          {/* Availability Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#E5EAF2] bg-[#F8FAFC] p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#101B3D]">Helper Status:</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                    availability
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${availability ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {availability ? 'Available for Peer Doubts' : 'Busy / Not Accepting Doubts'}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                {availability
                  ? 'Students can discover you and assign doubts in the helper matching directory.'
                  : 'You will temporarily not be matched with newly posted doubts.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleAvailability}
              disabled={savingHelper}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                availability
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              } disabled:opacity-50 cursor-pointer shrink-0`}
            >
              {savingHelper ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Updating…
                </>
              ) : availability ? (
                'Set to Busy'
              ) : (
                'Set to Available'
              )}
            </button>
          </div>

          {/* Teaching Subjects */}
          <div className="space-y-3">
            <div>
              <label htmlFor="settings-subjects" className="block text-xs font-bold text-[#344568] mb-1.5">
                Qualified Teaching Subjects (comma-separated)
              </label>
              <input
                id="settings-subjects"
                type="text"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                placeholder="e.g. Data Structures, Linear Algebra, Machine Learning, Calculus"
                disabled={savingHelper}
                className="h-11 w-full rounded-xl border border-[#E5EAF2] bg-[#F8FAFC] px-3.5 text-sm text-[#101B3D] outline-none transition-all focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10 disabled:opacity-60"
              />
              <p className="text-xs text-[#64748B] mt-1">
                Students use these subject tags to match with your profile.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveSubjects}
                disabled={savingHelper}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-bold text-white hover:bg-[#1D4ED8] transition-all disabled:opacity-50 cursor-pointer"
              >
                {savingHelper ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Save Subjects
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Security & Password Management ──────────────────────── */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-[#F1F5F9]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#101B3D]">Security &amp; Password</h2>
            <p className="text-xs text-[#64748B]">Update your login password and manage access</p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-semibold text-red-700">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg" noValidate>
          {/* Current Password */}
          <div>
            <label htmlFor="settings-current-pw" className="block text-xs font-bold text-[#344568] mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                id="settings-current-pw"
                type={showCurrentPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                disabled={savingPassword}
                className="h-11 w-full rounded-xl border border-[#E5EAF2] bg-[#F8FAFC] pl-9 pr-10 text-sm text-[#101B3D] outline-none transition-all focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="settings-new-pw" className="block text-xs font-bold text-[#344568] mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                id="settings-new-pw"
                type={showNewPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                disabled={savingPassword}
                className="h-11 w-full rounded-xl border border-[#E5EAF2] bg-[#F8FAFC] pl-9 pr-10 text-sm text-[#101B3D] outline-none transition-all focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <PasswordStrength password={newPassword} />
          </div>

          {/* Confirm New Password */}
          <div>
            <label htmlFor="settings-confirm-pw" className="block text-xs font-bold text-[#344568] mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                id="settings-confirm-pw"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={savingPassword}
                className="h-11 w-full rounded-xl border border-[#E5EAF2] bg-[#F8FAFC] pl-9 pr-10 text-sm text-[#101B3D] outline-none transition-all focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-bold text-white shadow-xs shadow-blue-500/20 hover:bg-[#1D4ED8] transition-all disabled:opacity-50 cursor-pointer"
          >
            {savingPassword ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Updating Password…
              </>
            ) : (
              <>
                <Lock size={14} />
                Update Password
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── Notification Preferences ────────────────────────────── */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-[#F1F5F9]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#101B3D]">Notification Preferences</h2>
            <p className="text-xs text-[#64748B]">Choose how you stay notified on academic activities</p>
          </div>
        </div>

        <div className="space-y-4 divide-y divide-[#F1F5F9]">
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-bold text-[#101B3D]">Email Notifications</p>
              <p className="text-xs text-[#64748B]">Receive digests and important announcements</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setNotifications({ ...notifications, emailUpdates: !notifications.emailUpdates })
              }
              className={`w-12 h-6 rounded-full relative transition-colors ${
                notifications.emailUpdates ? 'bg-[#2563EB]' : 'bg-[#E5EAF2]'
              }`}
              aria-pressed={notifications.emailUpdates}
            >
              <span
                className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-xs transition-transform ${
                  notifications.emailUpdates ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-sm font-bold text-[#101B3D]">Doubt Answers &amp; Claims</p>
              <p className="text-xs text-[#64748B]">Notify when someone answers your posted doubt</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setNotifications({ ...notifications, doubtAnswers: !notifications.doubtAnswers })
              }
              className={`w-12 h-6 rounded-full relative transition-colors ${
                notifications.doubtAnswers ? 'bg-[#2563EB]' : 'bg-[#E5EAF2]'
              }`}
              aria-pressed={notifications.doubtAnswers}
            >
              <span
                className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-xs transition-transform ${
                  notifications.doubtAnswers ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-sm font-bold text-[#101B3D]">Moderation &amp; Quality Reviews</p>
              <p className="text-xs text-[#64748B]">Notify when submitted answers are reviewed</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setNotifications({
                  ...notifications,
                  moderationAlerts: !notifications.moderationAlerts,
                })
              }
              className={`w-12 h-6 rounded-full relative transition-colors ${
                notifications.moderationAlerts ? 'bg-[#2563EB]' : 'bg-[#E5EAF2]'
              }`}
              aria-pressed={notifications.moderationAlerts}
            >
              <span
                className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-xs transition-transform ${
                  notifications.moderationAlerts ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Account Actions (Sign Out) ──────────────────────────── */}
      <div className="rounded-2xl border border-red-200/60 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <LogOut size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#101B3D]">Session Actions</h2>
            <p className="text-xs text-[#64748B]">Sign out of your active DoubtBridge session</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-all cursor-pointer"
        >
          <LogOut size={14} />
          Sign Out of Account
        </button>
      </div>
    </div>
  );
}
