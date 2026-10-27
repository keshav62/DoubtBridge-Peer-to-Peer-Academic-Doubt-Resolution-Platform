'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  HelpCircle,
  Users,
  BookOpen,
  Bookmark,
  Search,
  Bell,
  ArrowRight,
  CheckCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';

export default function DashboardPreview() {
  const recentDoubts = [
    {
      title: 'Why is time complexity of binary search O(log n)?',
      course: 'DSA',
      courseBg: 'bg-blue-50 text-blue-600 border-blue-200',
      time: '2h ago',
      status: 'Open',
      statusClass: 'bg-blue-50 text-blue-600 border-blue-200',
      icon: HelpCircle,
    },
    {
      title: 'Difference between INNER JOIN and LEFT JOIN?',
      course: 'DBMS',
      courseBg: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      time: '5h ago',
      status: 'In Progress',
      statusClass: 'bg-amber-50 text-amber-600 border-amber-200',
      icon: Clock,
    },
    {
      title: 'What is a deadlock? Give a real-life example.',
      course: 'OS',
      courseBg: 'bg-rose-50 text-rose-600 border-rose-200',
      time: '1d ago',
      status: 'Resolved',
      statusClass: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#F8FAFC] border-t border-[#E5EAF2]/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Interactive Product Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            {/* Dashboard Mock Window Container */}
            <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-blue-900/10 overflow-hidden flex flex-col md:flex-row text-xs">
              
              {/* Mini Sidebar */}
              <div className="w-full md:w-48 bg-[#FAFAFA] border-b md:border-b-0 md:border-r border-slate-200/70 p-3.5 flex flex-col justify-between shrink-0">
                <div className="space-y-4">
                  {/* Mini Logo */}
                  <div className="flex items-center gap-2 px-1">
                    <div className="flex items-end gap-0.5 h-5">
                      <span className="w-1.5 h-4 rounded-full bg-[#2563EB]" />
                      <span className="w-1.5 h-5 rounded-full bg-[#06B6D4]" />
                    </div>
                    <span className="font-bold text-[#101B3D] text-sm tracking-tight">
                      DoubtBridge
                    </span>
                  </div>

                  {/* Nav Links */}
                  <nav className="space-y-1">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#EFF6FF] text-[#2563EB] font-semibold">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </div>

                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Doubts</span>
                      </div>
                      <span className="text-[10px] text-slate-400">›</span>
                    </div>

                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Help Others</span>
                    </div>

                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>Knowledge Hub</span>
                    </div>

                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100">
                      <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                      <span>Bookmarks</span>
                    </div>
                  </nav>
                </div>

                {/* Bottom User Profile */}
                <div className="pt-3 mt-4 border-t border-slate-200/60 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden border border-slate-200 shrink-0">
                      <Image src="/images/avatar-keshav.jpg" alt="Keshav Singh" fill className="object-cover" />
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-[#101B3D] text-[11px] truncate leading-tight">
                        Keshav Singh
                      </p>
                      <p className="text-[9px] text-[#64748B]">Student</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                </div>
              </div>

              {/* Mini Main Content Area */}
              <div className="flex-1 p-4 bg-white flex flex-col justify-between space-y-4">
                
                {/* Search & Top Action Bar */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 bg-[#F1F5F9]/70 rounded-lg px-2.5 py-1.5 flex-1 max-w-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] text-slate-400 truncate">
                      Search doubts, subjects, or topics...
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-500">
                      <Bell className="w-3 h-3" />
                    </div>
                    <div className="relative w-6 h-6 rounded-full overflow-hidden border border-slate-200">
                      <Image src="/images/avatar-keshav.jpg" alt="Profile" fill className="object-cover" />
                    </div>
                  </div>
                </div>

                {/* 4 Mini Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-[#EFF6FF] rounded-lg p-2 border border-blue-100">
                    <span className="text-[10px] text-[#2563EB] font-bold block">12</span>
                    <span className="text-[9px] text-[#64748B]">Total Doubts</span>
                  </div>

                  <div className="bg-[#ECFDF5] rounded-lg p-2 border border-emerald-100">
                    <span className="text-[10px] text-[#10B981] font-bold block">8</span>
                    <span className="text-[9px] text-[#64748B]">Resolved</span>
                  </div>

                  <div className="bg-[#FFFBEB] rounded-lg p-2 border border-amber-100">
                    <span className="text-[10px] text-[#F59E0B] font-bold block">3</span>
                    <span className="text-[9px] text-[#64748B]">Pending</span>
                  </div>

                  <div className="bg-[#FAF5FF] rounded-lg p-2 border border-purple-100">
                    <span className="text-[10px] text-[#8B5CF6] font-bold block">5</span>
                    <span className="text-[9px] text-[#64748B]">Helping Others</span>
                  </div>
                </div>

                {/* Recent Doubts List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#101B3D] text-[11px]">Recent Doubts</span>
                    <span className="text-[10px] font-semibold text-[#2563EB] flex items-center gap-0.5">
                      View All →
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {recentDoubts.map((doubt, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg border border-slate-100 bg-[#FAFAFA] flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <doubt.icon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="font-medium text-[#101B3D] text-[10px] truncate">
                            {doubt.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${doubt.courseBg}`}>
                            {doubt.course}
                          </span>
                          <span className="text-[9px] text-slate-400 hidden sm:inline">
                            {doubt.time}
                          </span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${doubt.statusClass}`}>
                            {doubt.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Right Column: Platform Preview Copy & Features */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] mb-3">
              <span className="text-xs font-bold text-[#2563EB] tracking-wider uppercase">
                PLATFORM PREVIEW
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101B3D] tracking-tight leading-tight">
              A cleaner way to learn together.
            </h2>

            <p className="mt-4 text-base text-[#64748B] leading-relaxed">
              Track your doubts, find peer helpers, and explore approved solutions — all from a simple and modern dashboard.
            </p>

            {/* Checklist */}
            <div className="mt-6 space-y-3">
              {[
                'Submit and track your doubts',
                'Get matched with peer helpers',
                'Explore verified answers',
                'Build your learning profile',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 fill-[#2563EB] text-white" />
                  </div>
                  <span className="text-sm font-medium text-[#101B3D]">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#2563EB] text-white font-semibold text-sm hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all group"
              >
                <span>Explore the Platform</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
