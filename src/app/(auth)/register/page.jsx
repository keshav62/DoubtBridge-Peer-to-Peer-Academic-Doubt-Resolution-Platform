'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, ChevronDown, ArrowRight, AlertCircle, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

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
        <li key={c.label} className={`flex items-center gap-1.5 text-xs ${c.ok ? 'text-emerald-600' : 'text-[#94A3B8]'}`}>
          <CheckCircle2 size={12} className={c.ok ? 'text-emerald-500' : 'text-[#CBD5E1]'} />
          {c.label}
        </li>
      ))}
    </ul>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', role: 'STUDENT', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setErrors(data.errors || [data.error || 'Registration failed.']);
          return;
        }

        router.push('/dashboard');
        router.refresh();
      } catch {
        setErrors(['A network error occurred. Please check your connection.']);
      }
    });
  };

  const inputCls =
    'h-11 w-full rounded-xl border border-[#E5EAF2] bg-white text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none transition-all focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10 disabled:opacity-60';
  const labelCls = 'block text-sm font-semibold text-[#344568] mb-1.5';

  return (
    <div className="min-h-screen bg-[#F5F9FF] flex items-center justify-center px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#DBEAFE] opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#EDE9FE] opacity-30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[480px]">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2.5 mb-4 group">
            <div className="flex items-end gap-0.5 h-7">
              <span className="w-2 h-5 rounded-full bg-[#2563EB] transition-transform group-hover:scale-105" />
              <span className="w-2 h-7 rounded-full bg-[#06B6D4] transition-transform group-hover:scale-105" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#101B3D]">DoubtBridge</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#101B3D] mb-1">Join DoubtBridge</h1>
          <p className="text-sm text-[#64748B]">Collaborate, learn, and resolve academic challenges together</p>
        </div>

        {/* Error alerts */}
        {errors.length > 0 && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
          >
            {errors.map((err, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-red-700">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-8 shadow-sm shadow-slate-200/60">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className={labelCls}>Full Name</label>
              <div className="relative">
                <User size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Alex Rivera"
                  disabled={isPending}
                  className={`${inputCls} pl-9 pr-3.5`}
                />
              </div>
            </div>

            {/* Academic Email */}
            <div>
              <label htmlFor="reg-email" className={labelCls}>Academic Email</label>
              <div className="relative">
                <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="alex@university.edu"
                  disabled={isPending}
                  className={`${inputCls} pl-9 pr-3.5`}
                />
              </div>
            </div>

            {/* Role select — only STUDENT and HELPER can self-register */}
            <div>
              <label htmlFor="reg-role" className={labelCls}>Primary Role</label>
              <div className="relative">
                <select
                  id="reg-role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  disabled={isPending}
                  className="h-11 w-full appearance-none rounded-xl border border-[#E5EAF2] bg-white pl-3.5 pr-9 text-sm text-[#101B3D] outline-none transition-all focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10 cursor-pointer disabled:opacity-60"
                >
                  <option value="STUDENT">Student — Ask questions &amp; learn</option>
                  <option value="HELPER">Peer Helper — Answer &amp; earn reputation</option>
                </select>
                <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className={labelCls}>Password</label>
              <div className="relative">
                <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  disabled={isPending}
                  className={`${inputCls} pl-9 pr-10`}
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
              <PasswordStrength password={form.password} />
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
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-[#64748B]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
