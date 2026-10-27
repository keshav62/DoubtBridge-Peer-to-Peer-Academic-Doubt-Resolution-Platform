'use client';

import { MessageSquareText, Users, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

export default function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Ask',
      desc: 'Submit your doubt with its course and topic.',
      icon: MessageSquareText,
    },
    {
      num: '02',
      title: 'Connect',
      desc: 'Find a suitable peer helper who can explain the concept.',
      icon: Users,
    },
    {
      num: '03',
      title: 'Understand',
      desc: 'Receive a clear explanation and explore useful answers for future reference.',
      icon: BookOpen,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[#F5F9FF] relative overflow-hidden">
      {/* Decorative ambient curves / subtle background glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-cyan-100/50 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200/60 mb-3">
            <span className="text-xs font-bold text-[#2563EB] tracking-wider uppercase">
              HOW IT WORKS
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101B3D] tracking-tight">
            Get Help in Three Simple Steps
          </h2>

          <p className="mt-3 text-base sm:text-lg text-[#64748B]">
            From asking a doubt to understanding the solution — all in a few clicks.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
          
          {/* Connecting dashed line behind steps on desktop */}
          <div className="hidden md:block absolute top-7 left-[20%] right-[20%] h-0.5 border-t-2 border-dashed border-blue-200 z-0 pointer-events-none" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center p-6 bg-white/70 backdrop-blur-xs md:bg-transparent rounded-2xl md:rounded-none border md:border-none border-blue-100/60"
              >
                {/* Step Header with number circle + icon squircle */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-[#DBEAFE] text-[#2563EB] font-bold text-sm flex items-center justify-center shadow-xs">
                    {step.num}
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                {/* Step Content */}
                <h3 className="text-xl font-bold text-[#101B3D]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-[#64748B] leading-relaxed max-w-xs">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}

        </div>
      </div>
    </section>
  );
}
