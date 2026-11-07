import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || undefined;

    const helpers = await prisma.user.findMany({
      where: {
        role: 'HELPER',
      },
      select: {
        id: true,
        name: true,
        reputation: true,
        subjects: true,
        isAvailable: true,
        avatar: true,
        _count: { select: { answers: true } },
      },
      orderBy: { reputation: 'desc' },
    });

    let filteredHelpers = helpers;
    if (subject) {
      const normalizedSubject = subject.trim().toLowerCase();
      filteredHelpers = helpers.filter((helper) => {
        if (!helper.subjects) return false;
        const subjectList = helper.subjects.split(',').map((s) => s.trim().toLowerCase());
        return subjectList.includes(normalizedSubject);
      });
    }

    return NextResponse.json({ success: true, helpers: filteredHelpers });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
