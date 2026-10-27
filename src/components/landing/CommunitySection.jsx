'use client';

import Image from 'next/image';
import { Users, UserCheck, BookMarked, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

export default function CommunitySection() {
  const stats = [
    {
      value: '10K+',
      label: 'Doubts Resolved',
      icon: Users,
      color: 'text-[#2563EB]',
      bg: 'bg-blue-50',
    },
    {
      value: '2.5K+',
      label: 'Active Peer Mentors',
      icon: UserCheck,
      color: 'text-[#10B981]',
      bg: 'bg-emerald-50',
    },
    {
      value: '500+',
      label: 'Study Resources',
      icon: BookMarked,
      color: 'text-[#8B5CF6]',
      bg: 'bg-purple-50',
    },
    {
      value: '5K+',
      label: 'Students Learning',
      icon: Trophy,
      color: 'text-[#F59E0B]',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <section id="community" className="py-20 md:py-28 bg-white border-t border-[#E5EAF2]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Heading, Subtitle & 4 Stats */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-[#101B3D] tracking-tight leading-[1.18]">
              A growing community <br />
              of curious learners.
            </h2>

            <p className="mt-4 text-base sm:text-lg text-[#64748B]">
              Students helping students, every day.
            </p>

            {/* 4 Stats Grid */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-[#E5EAF2]">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="space-y-2">
                    <div className={`w-9 h-9 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-extrabold text-[#101B3D] tracking-tight">
                        {stat.value}
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5 font-medium leading-tight">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column: Community Photograph + Decorative Caption */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 relative"
          >
            {/* Playful curved badge / caption on top-right of image */}
            <div className="absolute -top-7 right-4 z-20 hidden sm:flex items-center gap-2">
              <span className="text-sm font-bold text-[#2563EB] tracking-wide italic font-serif">
                Learn · Share · Solve · Together
              </span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2V8" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
                <path d="M4 7L8 10" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                <path d="M20 7L16 10" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Photograph Container */}
            <div className="relative rounded-[28px] overflow-hidden shadow-2xl shadow-blue-900/10 border border-slate-100 aspect-[16/10] bg-slate-100">
              <Image
                src="/images/students-community.jpg"
                alt="University students collaborating together in university study room"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
