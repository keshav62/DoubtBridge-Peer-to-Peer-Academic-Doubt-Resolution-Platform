import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyPasswordResetToken } from '@/lib/passwordReset';
import { logAuthError } from '@/lib/diagnostics';

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .regex(/[A-Za-z]/, 'Password must contain at least one letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.'),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
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

    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || 'Invalid password submission.',
          errors: validation.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // 1. Initial verification of token format, signature, and expiration
    const initialVerification = await verifyPasswordResetToken(token);
    if (!initialVerification.valid) {
      return NextResponse.json(
        {
          success: false,
          error: initialVerification.error || 'Invalid or expired password reset link.',
        },
        { status: 400 }
      );
    }

    const userId = initialVerification.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, passwordHash: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account not found or inactive.',
        },
        { status: 400 }
      );
    }

    // 2. Full verification against user password hash snapshot (single-use guarantee)
    const fullVerification = await verifyPasswordResetToken(token, user);
    if (!fullVerification.valid) {
      return NextResponse.json(
        {
          success: false,
          error: fullVerification.error || 'This reset token is invalid or has already been used.',
        },
        { status: 400 }
      );
    }

    // Hash the new password securely
    const newHash = await bcrypt.hash(password, 10);

    // Update password in database. Because the reset token incorporates the previous password hash,
    // changing passwordHash immediately invalidates this reset token and any older tokens!
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. Please sign in with your new password.',
    });
  } catch (error) {
    const correlationId = logAuthError({ route: '/api/auth/reset-password', error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset password. Please try again.',
        correlationId,
      },
      { status: 500 }
    );
  }
}
