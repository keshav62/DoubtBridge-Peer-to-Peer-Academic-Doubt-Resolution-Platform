import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Execute a real SQL query against PostgreSQL to verify connectivity
    await prisma.$queryRawUnsafe('SELECT 1 as health_check');

    return NextResponse.json(
      {
        success: true,
        database: 'connected',
        message: 'Database connection successful',
      },
      { status: 200 }
    );
  } catch (error) {
    // Log detailed server-side error without exposing database internals or credentials to the client
    console.error('[HealthCheck] Database connection error:', error.message || error);

    return NextResponse.json(
      {
        success: false,
        database: 'disconnected',
        message: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}

