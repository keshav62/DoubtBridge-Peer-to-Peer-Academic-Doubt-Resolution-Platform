import { prisma } from '@/lib/prisma';
import HelpersFilteredList from '@/components/helpers/HelpersFilteredList';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getHelpers() {
  try {
    const helpers = await prisma.user.findMany({
      where: { role: 'HELPER' },
      select: {
        id: true,
        name: true,
        reputation: true,
        subjects: true,
        isAvailable: true,
        _count: { select: { answers: true } },
      },
      orderBy: { reputation: 'desc' },
    });

    const activeHelpersCount = helpers.filter((h) => h.isAvailable).length;
    const totalAnswers = helpers.reduce((sum, h) => sum + h._count.answers, 0);
    const avgAnswers = helpers.length > 0 ? Math.round(totalAnswers / helpers.length) : 0;

    return {
      success: true,
      helpers,
      stats: {
        activeHelpers: activeHelpersCount,
        avgAnswers,
      },
    };
  } catch (error) {
    console.error('Error fetching helpers:', error);
    return { success: false, error: 'Unable to load helpers. Please try again later.' };
  }
}

export default async function HelpersDirectoryPage() {
  const { success, helpers, stats, error } = await getHelpers();

  if (!success) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Help Someone Learn
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Share what you know and help classmates understand difficult concepts.
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--accent-rose)', fontSize: '0.95rem' }}>
            Error loading helpers: {error}
          </p>
        </div>
      </div>
    );
  }

  if (!helpers || helpers.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Help Someone Learn
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Share what you know and help classmates understand difficult concepts.
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            No helpers available at the moment. Check back later!
          </p>
        </div>
      </div>
    );
  }

  return <HelpersFilteredList helpers={helpers} stats={stats} />;
}
