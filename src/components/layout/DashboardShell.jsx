'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';

/**
 * DashboardShell — Client Component
 *
 * Owns the mobile-drawer boolean state so the route layout.jsx
 * can stay a plain Server Component.
 *
 * Props:
 *   children  {ReactNode}
 *   userRole  {string=}   — forwarded to Sidebar for role-gated nav
 */
export default function DashboardShell({ children, userRole }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F9FF]">

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
      />

      {/* ── Right column ─────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/*
          Main content area — bg-[#F5F9FF] light blue-white surface
          overflow-y-auto lets the page scroll independently of the sidebar
        */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto bg-[#F5F9FF] p-6 md:p-8 focus:outline-none"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
