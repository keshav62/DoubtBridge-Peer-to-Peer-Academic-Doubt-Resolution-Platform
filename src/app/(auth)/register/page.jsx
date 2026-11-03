'use client';

import Link from 'next/link';
import { useState } from 'react';
import { User, Mail, Lock, ChevronDown, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'STUDENT',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = '/dashboard';
  };

  const inputCls =
    'h-11 w-full rounded-xl border border-[#E5EAF2] bg-white text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none transition-all focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10';

  const labelCls = 'block text-sm font-semibold text-[#344568] mb-1.5';

  return (
    <div className="min-h-screen bg-[#F5F9FF] flex items-center justify-center px-4 py-12">
      {/* Subtle background gradients */}
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

        {/* Card */}
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-8 shadow-sm shadow-slate-200/60">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className={labelCls}>Full Name</label>
              <div className="relative">
                <User size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Alex Rivera"
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
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="alex@university.edu"
                  className={`${inputCls} pl-9 pr-3.5`}
                />
              </div>
            </div>

            {/* Role select */}
            <div>
              <label htmlFor="reg-role" className={labelCls}>Primary Role</label>
              <div className="relative">
                <select
                  id="reg-role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="h-11 w-full appearance-none rounded-xl border border-[#E5EAF2] bg-white pl-3.5 pr-9 text-sm text-[#101B3D] outline-none transition-all focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10 cursor-pointer"
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
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className={`${inputCls} pl-9 pr-3.5`}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#2563EB] py-3 text-sm font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-[#1D4ED8] transition-all"
            >
              Create Account
              <ArrowRight size={15} />
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
