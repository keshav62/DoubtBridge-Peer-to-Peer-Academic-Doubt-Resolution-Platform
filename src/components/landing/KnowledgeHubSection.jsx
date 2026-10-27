'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function KnowledgeHubSection() {
  const resources = [
    {
      title: 'Binary Search Explained',
      subject: 'DSA',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-purple-100 text-purple-700',
    },
    {
      title: 'Normalization in DBMS',
      subject: 'DBMS',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Process Scheduling',
      subject: 'OS',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      iconBg: 'bg-rose-100 text-rose-700',
    },
    {
      title: 'REST API Fundamentals',
      subject: 'Web',
      badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      iconBg: 'bg-blue-100 text-blue-700',
    },
  ];

  return (
    <section id="knowledge-hub" className="py-20 md:py-28 bg-white border-t border-[#E5EAF2]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Real Study Desk Photograph */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-100 aspect-[4/3] bg-slate-100">
              <Image
                src="/images/knowledge-hub.jpg"
                alt="University study desk with textbooks, notebook and laptop"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>

          {/* Middle Column: Copy & Explanations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-4"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] mb-3">
              <span className="text-xs font-bold text-[#2563EB] tracking-wider uppercase">
                KNOWLEDGE HUB
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-extrabold text-[#101B3D] tracking-tight leading-tight">
              Good answers should never disappear.
            </h2>

            <p className="mt-3 text-sm sm:text-base text-[#64748B] leading-relaxed">
              Explore a growing collection of verified explanations contributed by students and reviewed by academic moderators.
            </p>

            <div className="mt-6">
              <Link
                href="/knowledge"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#2563EB] font-semibold text-sm border border-[#E5EAF2] hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
              >
                <span>Explore Knowledge Hub</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          {/* Right Column: 4 Sample Resource Preview Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3 space-y-3"
          >
            {resources.map((item, idx) => (
              <Link
                key={idx}
                href="/knowledge"
                className="block p-3 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#101B3D] truncate group-hover:text-[#2563EB] transition-colors">
                      {item.title}
                    </span>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${item.badgeClass}`}>
                    {item.subject}
                  </span>
                </div>
              </Link>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
