import DashboardShell from '@/components/layout/DashboardShell';

/**
 * DashboardLayout — Server Component
 * ─────────────────────────────────────────────────────────────────
 * Wraps all routes inside (dashboard)/ with the shared shell.
 * Interactive state (mobile drawer) lives in DashboardShell so this
 * file can stay a pure Server Component.
 *
 * To add role-gating, pass a userRole prop to DashboardShell,
 * e.g. from a server-side session lookup:
 *   const session = await getServerSession();
 *   <DashboardShell userRole={session?.user?.role}>
 */
export default function DashboardLayout({ children }) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}
