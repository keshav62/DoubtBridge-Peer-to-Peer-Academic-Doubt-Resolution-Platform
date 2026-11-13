import DashboardShell from '@/components/layout/DashboardShell';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * DashboardLayout — Server Component
 * ─────────────────────────────────────────────────────────────────
 * Resolves the authenticated user server-side and injects it into
 * the shell so the Navbar can display real user data.
 * Unauthenticated requests are redirected to /login by middleware first;
 * this is a secondary guard.
 */
export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardShell user={user}>
      {children}
    </DashboardShell>
  );
}
