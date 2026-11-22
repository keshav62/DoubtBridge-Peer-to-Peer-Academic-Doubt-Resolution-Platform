'use client';

import { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Contains a letter', ok: /[A-Za-z]/.test(password) },
    { label: 'Contains a number', ok: /[0-9]/.test(password) },
  ];
  if (!password) return null;
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

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing password reset token. Please request a new reset link.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain at least one letter and one number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password, confirmPassword }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || 'Failed to reset password.');
          return;
        }

        setSuccess(true);
        setTimeout(() => {
          router.push('/login?reset=success');
        }, 1500);
      } catch {
        setError('A network error occurred. Please check your connection.');
      }
    });
  };

  if (!token) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <AlertCircle size={32} className="mx-auto mb-3 text-amber-500" />
        <h2 className="text-lg font-bold text-[#101B3D] mb-1">Invalid or Missing Token</h2>
        <p className="text-sm text-[#64748B] mb-5">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E5EAF2] bg-white p-8 shadow-sm shadow-slate-200/60">
      {success ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#101B3D] mb-1">Password Updated!</h3>
            <p className="text-sm text-[#64748B]">
              Your password has been changed. Redirecting to sign in…
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* New Password */}
          <div className="space-y-1.5">
            <label htmlFor="reset-new-password" className="block text-sm font-semibold text-[#344568]">
              New Password
            </label>
            <div className="relative">
              <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isPending}
                className="h-11 w-full rounded-xl border border-[#E5EAF2] bg-white pl-9 pr-10 text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none transition-all focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label htmlFor="reset-confirm-password" className="block text-sm font-semibold text-[#344568]">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                id="reset-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isPending}
                className="h-11 w-full rounded-xl border border-[#E5EAF2] bg-white pl-9 pr-10 text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none transition-all focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#2563EB] py-3 text-sm font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-[#1D4ED8] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Updating password…
              </>
            ) : (
              <>
                Update Password
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F5F9FF] flex items-center justify-center px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#DBEAFE] opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#EDE9FE] opacity-30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[440px]">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2.5 mb-4 group">
            <div className="flex items-end gap-0.5 h-7">
              <span className="w-2 h-5 rounded-full bg-[#2563EB] transition-transform group-hover:scale-105" />
              <span className="w-2 h-7 rounded-full bg-[#06B6D4] transition-transform group-hover:scale-105" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#101B3D]">DoubtBridge</span>
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#2563EB] flex items-center justify-center mb-3">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#101B3D] mb-1">Set new password</h1>
          <p className="text-sm text-[#64748B]">Choose a strong password to protect your account</p>
        </div>

        <Suspense fallback={<div className="text-center text-[#64748B] text-sm">Loading reset form...</div>}>
          <ResetPasswordForm />
        </Suspense>

        <p className="mt-6 text-center text-sm text-[#64748B]">
          Remember your credentials?{' '}
          <Link href="/login" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
