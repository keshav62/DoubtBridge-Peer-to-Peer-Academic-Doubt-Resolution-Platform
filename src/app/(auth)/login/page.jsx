'use client';

import { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || 'Invalid email or password.');
          return;
        }

        // Safe redirect — only allow relative URLs
        const target = callbackUrl.startsWith('/') ? callbackUrl : '/dashboard';
        router.push(target);
        router.refresh();
      } catch {
        setError('A network error occurred. Please check your connection.');
      }
    });
  };

  return (
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
        <h1 className="text-2xl font-extrabold text-[#101B3D] mb-1">Welcome back</h1>
        <p className="text-sm text-[#64748B]">Sign in to access your doubts and peer sessions</p>
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

      {/* Card */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-8 shadow-sm shadow-slate-200/60">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-sm font-semibold text-[#344568]">
              Academic Email
            </label>
            <div className="relative">
              <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                id="login-email"
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

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="login-password" className="block text-sm font-semibold text-[#344568]">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
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
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#2563EB] py-3 text-sm font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-[#1D4ED8] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Register link */}
      <p className="mt-6 text-center text-sm text-[#64748B]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F5F9FF] flex items-center justify-center px-4 py-12">
      {/* Subtle background gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#DBEAFE] opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#EDE9FE] opacity-30 blur-3xl" />
      </div>

      <Suspense fallback={<div className="text-center text-[#64748B] text-sm">Loading sign-in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
