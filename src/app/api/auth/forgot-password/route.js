import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generatePasswordResetToken } from '@/lib/passwordReset';
import { logAuthError } from '@/lib/diagnostics';

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.').toLowerCase(),
});

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body.' },
        { status: 400 }
      );
    }

    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || 'Invalid email address.',
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Look up user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        isActive: true,
      },
    });

    // To prevent email enumeration attacks, always return success even if user not found or inactive
    if (!user || !user.isActive || !user.passwordHash) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been prepared.',
      });
    }

    // Generate cryptographic reset token
    const token = await generatePasswordResetToken(user);

    // In a production environment with an email service (e.g., Resend, Sendgrid, AWS SES),
    // we would dispatch the email here:
    // await sendPasswordResetEmail({ to: user.email, token });
    //
    // In dev / test environments or when explicitly requested, we return the token
    // for seamless automated testing and local debugging without mock delivery.
    const isDevOrTest = process.env.NODE_ENV !== 'production' || process.env.ENABLE_AUTH_DEBUG === 'true';

    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been prepared.',
      ...(isDevOrTest && {
        resetToken: token,
        resetUrl: `/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`,
      }),
    });
  } catch (error) {
    const correlationId = logAuthError({ route: '/api/auth/forgot-password', error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process password reset request. Please try again later.',
        correlationId,
      },
      { status: 500 }
    );
  }
}
