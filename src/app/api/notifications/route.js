import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getNotifications } from '@/features/notifications/service';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const read = searchParams.get('read');
    const type = searchParams.get('type') || undefined;

    const result = await getNotifications({
      userId: user.id,
      page,
      limit,
      read: read !== null ? read : undefined,
      type,
    });

    return NextResponse.json({
      success: true,
      notifications: result.notifications,
      pagination: result.pagination,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications.' },
      { status: error.statusCode || 500 }
    );
  }
}
