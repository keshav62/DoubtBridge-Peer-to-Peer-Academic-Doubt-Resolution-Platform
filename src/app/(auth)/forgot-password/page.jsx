'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, AlertCircle, CheckCircle2, Loader2, ArrowLeft, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || 'Failed to submit password reset request.');
          return;
        }

        setSubmitted(true);
        if (data.resetUrl) {
          setResetUrl(data.resetUrl);
        }
      } catch {
        setError('A network error occurred. Please check your connection.');
      }
    });
  };

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
            <KeyRound size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#101B3D] mb-1">Reset your password</h1>
          <p className="text-sm text-[#64748B]">
            Enter your registered email and we&apos;ll prepare password recovery instructions.
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-8 shadow-sm shadow-slate-200/60">
          {submitted ? (
            <div className="space-y-5 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101B3D] mb-1">Request Received</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  If an account exists with <span className="font-semibold text-[#101B3D]">{email}</span>, a secure password reset link has been prepared.
                </p>
              </div>

              {resetUrl && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-left space-y-2">
                  <p className="text-xs font-semibold text-blue-900">
                    Local / Test Environment Link:
                  </p>
                  <Link
                    href={resetUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:underline break-all"
                  >
                    Click here to open Reset Password page
                    <ArrowRight size={13} />
                  </Link>
                </div>
              )}

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#F1F5F9] py-3 text-sm font-semibold text-[#344568] hover:bg-[#E2E8F0] transition-colors"
              >
                <ArrowLeft size={15} />
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="forgot-email" className="block text-sm font-semibold text-[#344568]">
                  Academic Email
                </label>
                <div className="relative">
                  <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    disabled={isPending}
                    className="h-11 w-full rounded-xl border border-[#E5EAF2] bg-white pl-9 pr-3.5 text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none transition-all focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10 disabled:opacity-60"
                  />
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
                    Sending link…
                  </>
                ) : (
                  <>
                    Send Reset Instructions
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Back to login */}
        {!submitted && (
          <p className="mt-6 text-center text-sm text-[#64748B]">
            Remember your credentials?{' '}
            <Link href="/login" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
