'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const navLinks = [
    { name: 'Home', href: '#', id: 'home' },
    { name: 'Features', href: '#features', id: 'features' },
    { name: 'How It Works', href: '#how-it-works', id: 'how-it-works' },
    { name: 'Peer Mentors', href: '#community', id: 'community' },
    { name: 'Knowledge Hub', href: '#knowledge-hub', id: 'knowledge-hub' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5EAF2] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-end gap-1 h-8">
              <span className="w-2.5 h-6 rounded-full bg-[#2563EB] transition-transform group-hover:scale-105" />
              <span className="w-2.5 h-8 rounded-full bg-[#06B6D4] transition-transform group-hover:scale-105" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-[#101B3D] tracking-tight leading-tight">
                DoubtBridge
              </span>
              <span className="text-[10px] text-[#64748B] font-semibold tracking-wider uppercase">
                Learn · Ask · Solve
              </span>
            </div>
          </Link>

          {/* Center: Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setActiveTab(link.id)}
                  className={`relative text-sm font-medium transition-colors py-1 ${
                    isActive
                      ? 'text-[#101B3D] font-semibold'
                      : 'text-[#64748B] hover:text-[#2563EB]'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#2563EB] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              aria-label="Search topics and questions"
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-[#2563EB] hover:bg-slate-100 transition-colors"
              onClick={() => {
                const el = document.getElementById('knowledge-hub');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Search className="w-4 h-4" />
            </button>

            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-[#101B3D] rounded-xl border border-[#E5EAF2] hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-blue-700 rounded-full shadow-sm shadow-blue-500/25 transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/register"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2563EB] rounded-full"
            >
              Get Started
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#E5EAF2] bg-white px-4 pt-3 pb-6 space-y-3"
          >
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className="block py-2 text-base font-medium text-[#101B3D] hover:text-[#2563EB] transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-[#101B3D] rounded-xl border border-[#E5EAF2]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-[#2563EB] rounded-full shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
