'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Users, FileText, TrendingUp, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

export default function HeroSection() {
  return (
    <section className="relative pt-8 pb-16 md:pt-12 md:pb-24 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative"
          >
            {/* Top decorative sparks */}
            <div className="absolute -top-6 -left-3 hidden sm:block pointer-events-none">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <path d="M17 3V10" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M6 9L12 13" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M28 9L22 13" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] mb-6">
              <GraduationCap className="w-4 h-4 text-[#2563EB]" />
              <span className="text-xs font-bold text-[#2563EB] tracking-wider uppercase">
                PEER-POWERED LEARNING COMMUNITY
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.12] text-[#101B3D]">
              Never Let a Doubt <br />
              <span className="text-[#2563EB]">Stop Your Learning.</span>
            </h1>

            {/* Description */}
            <p className="mt-5 text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl">
              Get unstuck faster. Connect with knowledgeable classmates, discover clear explanations,
              and turn unanswered questions into opportunities to learn together.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/doubts/new"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#2563EB] text-white font-semibold text-sm sm:text-base hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all group"
              >
                <span>Ask a Doubt</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center px-7 py-3.5 rounded-full bg-white text-[#101B3D] font-semibold text-sm sm:text-base border border-[#E5EAF2] hover:border-blue-300 hover:bg-blue-50/40 transition-all"
              >
                Explore How It Works
              </a>
            </div>

            {/* Three Compact Benefits */}
            <div className="mt-10 pt-8 border-t border-[#E5EAF2] grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB] shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#101B3D]">
                  Find peer helpers
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB] shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#101B3D]">
                  Get clear explanations
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB] shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#101B3D]">
                  Learn together
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Photograph + Overlays */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative"
          >
            {/* Top-Right Decorative Sparks */}
            <div className="absolute -top-4 -right-2 z-20 hidden sm:block pointer-events-none">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <path d="M17 3V10" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M6 9L12 13" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M28 9L22 13" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Photograph Container */}
            <div className="relative rounded-[28px] overflow-hidden shadow-2xl shadow-blue-900/10 border border-slate-100 aspect-[4/3] sm:aspect-[16/11] bg-slate-100">
              <Image
                src="/images/students-hero.jpg"
                alt="University students collaborating around a laptop in a bright study space"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />

              {/* Subtle ambient gradient overlay at edges for crisp card contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Card 1: Study Together (Top Left) */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl shadow-slate-900/10 border border-slate-100/90 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#101B3D] leading-tight">
                  Study Together
                </p>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Knowledge grows when shared.
                </p>
              </div>
            </motion.div>

            {/* Floating Card 2: Social Proof Avatars (Bottom Right) */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl py-2 px-3 sm:px-4 shadow-xl shadow-slate-900/10 border border-slate-100/90 flex items-center gap-3"
            >
              <div className="flex -space-x-2 shrink-0">
                <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-white ring-1 ring-slate-100">
                  <Image src="/images/avatar-1.jpg" alt="Learner" fill className="object-cover" />
                </div>
                <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-white ring-1 ring-slate-100">
                  <Image src="/images/avatar-2.jpg" alt="Learner" fill className="object-cover" />
                </div>
                <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-white ring-1 ring-slate-100">
                  <Image src="/images/avatar-3.jpg" alt="Learner" fill className="object-cover" />
                </div>
                <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-white ring-1 ring-slate-100">
                  <Image src="/images/avatar-4.jpg" alt="Learner" fill className="object-cover" />
                </div>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-[#101B3D] flex items-center gap-1">
                <span>Join thousands of learners like you.</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#2563EB]" />
              </span>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
