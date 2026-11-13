import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUnreadNotificationCount } from '@/features/notifications/service';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const unreadCount = await getUnreadNotificationCount(user.id);
    return NextResponse.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch unread count.' },
      { status: error.statusCode || 500 }
    );
  }
}

