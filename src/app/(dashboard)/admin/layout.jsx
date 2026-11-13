import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Platform Control Center - DoubtBridge Admin',
  description: 'Administrative workspace for user management, platform oversight, moderation queues, and audit logs.',
};

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return <>{children}</>;
}

