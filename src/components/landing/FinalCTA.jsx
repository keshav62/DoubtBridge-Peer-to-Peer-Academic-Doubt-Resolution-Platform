'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function FinalCTA() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[32px] bg-gradient-to-r from-[#DBEAFE]/70 via-[#EFF6FF] to-[#EDE9FE]/70 border border-blue-100/90 p-8 sm:p-12 md:p-16 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
        >
          {/* Top-Right Decorative Sparks */}
          <div className="absolute top-6 right-6 z-10 hidden sm:block pointer-events-none">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M18 4V11" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M7 11L13 15" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M29 11L23 15" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Left Content */}
          <div className="max-w-xl text-center md:text-left">
            <span className="text-xs font-bold text-[#2563EB] tracking-wider uppercase block mb-2">
              START YOUR LEARNING JOURNEY
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-[#101B3D] tracking-tight leading-[1.15]">
              Your next breakthrough <br />
              starts with a question.
            </h2>

            <p className="mt-3 text-base sm:text-lg text-[#64748B]">
              Ask clearly. Learn together. Help someone else tomorrow.
            </p>
          </div>

          {/* Right Actions */}
          <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
            <Link
              href="/register"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#2563EB] text-white font-semibold text-base hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all group"
            >
              <span>Get Started — It&apos;s Free</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <p className="text-sm text-[#64748B]">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#2563EB] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
