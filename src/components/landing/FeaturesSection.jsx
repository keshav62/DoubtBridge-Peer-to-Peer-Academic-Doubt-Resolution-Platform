'use client';

import Image from 'next/image';
import { Users, FileCheck2, BookOpen, Search, CheckCircle2, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export default function FeaturesSection() {
  const subjectTags = [
    { name: 'DSA', active: true },
    { name: 'DBMS', active: false },
    { name: 'Operating Systems', active: false },
    { name: 'Web Development', active: false },
    { name: 'CN', active: false },
    { name: 'OOP', active: false },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-white border-t border-[#E5EAF2]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] mb-3">
            <span className="text-xs font-bold text-[#2563EB] tracking-wider uppercase">
              WHY DOUBTBRIDGE
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101B3D] tracking-tight">
            Learning works better together.
          </h2>

          <p className="mt-3 text-base sm:text-lg text-[#64748B]">
            A supportive space to ask, share, and grow.
          </p>
        </div>

        {/* 3 Feature Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Smart Peer Matching */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-[#E5EAF2] bg-white p-7 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#101B3D]">
                Smart Peer Matching
              </h3>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                Connect with students who understand your subject and are willing to help.
              </p>
            </div>

            {/* Custom Visual: Avatar Network */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center">
              <div className="relative w-64 h-40 bg-[#F8FAFC] rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden">
                {/* Connecting Dashed Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 256 160">
                  <line x1="45" y1="45" x2="128" y2="80" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="211" y1="45" x2="128" y2="80" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="45" y1="120" x2="128" y2="80" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="211" y1="120" x2="128" y2="80" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="3 3" />
                </svg>

                {/* Central Connection Bubble */}
                <div className="z-10 w-11 h-11 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                  <MessageSquare className="w-5 h-5 fill-white/20" />
                </div>

                {/* Surrounding Student Avatars */}
                <div className="absolute top-4 left-6 w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <Image src="/images/avatar-1.jpg" alt="Student 1" fill className="object-cover" />
                </div>
                <div className="absolute top-4 right-6 w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <Image src="/images/avatar-2.jpg" alt="Student 2" fill className="object-cover" />
                </div>
                <div className="absolute bottom-4 left-6 w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <Image src="/images/avatar-3.jpg" alt="Student 3" fill className="object-cover" />
                </div>
                <div className="absolute bottom-4 right-6 w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <Image src="/images/avatar-4.jpg" alt="Student 4" fill className="object-cover" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Clear Explanations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-[#E5EAF2] bg-white p-7 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#101B3D]">
                Clear Explanations
              </h3>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                Receive structured answers that help you understand the reasoning, not just the final result.
              </p>
            </div>

            {/* Custom Visual: Compact Verified Answer Preview */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center">
              <div className="w-full bg-[#F8FAFC] rounded-xl border border-slate-100 p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-slate-200 shrink-0">
                    <Image src="/images/avatar-1.jpg" alt="Peer Mentor" fill className="object-cover" />
                  </div>
                  <div className="space-y-1">
                    <div className="w-20 h-2 bg-slate-300 rounded-full" />
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                  </div>
                </div>

                {/* Skeleton answer lines */}
                <div className="space-y-1.5 pl-9">
                  <div className="w-full h-2 bg-slate-200 rounded-full" />
                  <div className="w-4/5 h-2 bg-slate-200 rounded-full" />
                  <div className="w-2/3 h-2 bg-slate-200 rounded-full" />
                </div>

                {/* Verified Answer Label */}
                <div className="pt-1 flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4 fill-emerald-100" />
                  <span>Verified Answer</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Knowledge That Stays */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl border border-[#E5EAF2] bg-white p-7 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#101B3D]">
                Knowledge That Stays
              </h3>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                Discover previously answered questions and revisit useful explanations whenever you need them.
              </p>
            </div>

            {/* Custom Visual: Search input & Topic tags */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col justify-center">
              <div className="bg-[#F8FAFC] rounded-xl border border-slate-100 p-3.5 space-y-3">
                {/* Search Bar Preview */}
                <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-2.5 py-1.5 shadow-2xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px] text-slate-400 flex-1 truncate">
                    Search questions, topics...
                  </span>
                  <div className="w-5 h-5 rounded-md bg-[#2563EB] text-white flex items-center justify-center">
                    <Search className="w-3 h-3" />
                  </div>
                </div>

                {/* Subject Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {subjectTags.map((tag) => (
                    <span
                      key={tag.name}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                        tag.active
                          ? 'bg-blue-100 text-[#2563EB] border-blue-200'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
