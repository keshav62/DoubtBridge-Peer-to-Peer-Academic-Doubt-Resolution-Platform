#!/usr/bin/env node

/**
 * ============================================================================
 * DoubtBridge — Bootstrap First Admin Account (CLI Tool)
 * ============================================================================
 *
 * Secure, controlled administrative CLI script to promote an existing registered
 * active user account to the ADMIN role.
 *
 * Usage:
 *   node scripts/create-admin.js <email> [--yes]
 *
 * Examples:
 *   node scripts/create-admin.js admin@example.com
 *   node scripts/create-admin.js admin@example.com --yes
 *
 * Safety Guarantees:
 *   - Never creates a duplicate user account (user must register first).
 *   - Never modifies passwords, hashes, or secrets.
 *   - Never exposes password hashes or database connection credentials in output.
 *   - Validates that the target account exists and is active.
 *   - Requires explicit confirmation before committing changes to the database.
 *   - Emits an immutable AuditLog record for full traceability.
 */

// Load environment variables (.env / .env.local) if not already loaded
try {
  require('dotenv').config();
} catch {
  // dotenv is optional if environment variables are already set in process.env
}

const readline = require('readline');
const { PrismaClient } = require('@prisma/client');

function printUsage() {
  console.log(`
DoubtBridge — Admin Bootstrap CLI

Usage:
  node scripts/create-admin.js <user-email> [options]

Arguments:
  <user-email>    The email address of the registered account to promote.

Options:
  -y, --yes       Skip interactive confirmation prompt (non-interactive mode).
  -h, --help      Display this help message.

Prerequisites:
  The target user must have already created an account through the normal
  registration flow (/register) and must have an active status.
`);
}

function promptConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  const autoConfirm = args.includes('-y') || args.includes('--yes');
  const positionalArgs = args.filter((arg) => !arg.startsWith('-'));

  let rawEmail = positionalArgs[0];

  // If email was not passed via arguments, ask interactively
  if (!rawEmail) {
    if (autoConfirm) {
      console.error('\x1b[31m[ERROR]\x1b[0m Email argument is required when using non-interactive flag (-y/--yes).');
      printUsage();
      process.exit(1);
    }
    rawEmail = await promptConfirmation('Enter the email address of the user to promote to ADMIN: ');
  }

  if (!rawEmail || !rawEmail.trim()) {
    console.error('\x1b[31m[ERROR]\x1b[0m Email address cannot be empty.');
    process.exit(1);
  }

  const normalizedEmail = rawEmail.trim().toLowerCase();

  // Basic email syntax validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    console.error(`\x1b[31m[ERROR]\x1b[0m "${normalizedEmail}" is not a valid email address.`);
    process.exit(1);
  }

  // Ensure DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.error('\x1b[31m[ERROR]\x1b[0m DATABASE_URL environment variable is not defined.');
    console.error('Please verify your .env file or environment configuration.');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    log: ['error'],
  });

  try {
    console.log(`\n\x1b[36m[DoubtBridge]\x1b[0m Connecting to database and verifying user account...`);

    // Find the user by unique normalized email. Notice: passwordHash is deliberately omitted.
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        department: true,
        academicYear: true,
        createdAt: true,
      },
    });

    // 1. Verify user exists
    if (!user) {
      console.error(`\n\x1b[31m[ERROR]\x1b[0m No user account found with email: \x1b[1m${normalizedEmail}\x1b[0m`);
      console.error(`Users must sign up through the application first (/register) before they can be promoted.`);
      process.exit(1);
    }

    // 2. Verify account is active
    if (!user.isActive) {
      console.error(`\n\x1b[31m[ERROR]\x1b[0m The account with email \x1b[1m${normalizedEmail}\x1b[0m is deactivated or suspended.`);
      console.error(`Suspended accounts cannot be promoted to the ADMIN role.`);
      process.exit(1);
    }

    // 3. Verify user is not already ADMIN
    if (user.role === 'ADMIN') {
      console.log(`\n\x1b[33m[NOTICE]\x1b[0m User \x1b[1m${user.name}\x1b[0m (${user.email}) is ALREADY an ADMIN.`);
      console.log(`No role modification needed. Account ID: ${user.id}`);
      process.exit(0);
    }

    // Display account overview for administrative verification
    console.log(`
\x1b[1m=== Target Account Details ===\x1b[0m
  User ID:      ${user.id}
  Full Name:    ${user.name}
  Email:        ${user.email}
  Department:   ${user.department || 'Not specified'}
  Year:         ${user.academicYear || 'Not specified'}
  Current Role: \x1b[33m${user.role}\x1b[0m
  New Role:     \x1b[32mADMIN\x1b[0m
  Status:       \x1b[32mActive\x1b[0m
  Registered:   ${user.createdAt.toISOString()}
==============================
`);

    // 4. Require explicit confirmation
    if (!autoConfirm) {
      const confirmation = await promptConfirmation(
        'Are you sure you want to promote this user to ADMIN? Type "yes" to confirm: '
      );

      if (confirmation.toLowerCase() !== 'yes') {
        console.log('\n\x1b[33m[ABORTED]\x1b[0m Operation cancelled by administrator. No changes were made.');
        process.exit(0);
      }
    } else {
      console.log('\x1b[33m[INFO]\x1b[0m Non-interactive confirmation flag (--yes) detected. Proceeding...');
    }

    // 5. Atomic database update + audit log entry
    console.log(`\nPromoting user ${user.email} to ADMIN...`);

    const result = await prisma.$transaction(async (tx) => {
      // Update role
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          updatedAt: true,
        },
      });

      // Write an immutable audit log record
      await tx.auditLog.create({
        data: {
          actorName: 'CLI Admin Bootstrap',
          actorRole: 'SYSTEM',
          actorEmail: 'system@cli',
          action: 'USER_ROLE_CHANGE',
          targetType: 'USER',
          targetId: user.id,
          metadata: JSON.stringify({
            previousRole: user.role,
            newRole: 'ADMIN',
            operation: 'scripts/create-admin.js',
            promotedAt: new Date().toISOString(),
          }),
        },
      });

      return updatedUser;
    });

    console.log(`
\x1b[32m✔ SUCCESS:\x1b[0m User has been successfully promoted to \x1b[1mADMIN\x1b[0m!

Summary:
  User ID:      ${result.id}
  Name:         ${result.name}
  Email:        ${result.email}
  Role:         ${result.role}
  Updated At:   ${result.updatedAt.toISOString()}

Audit log entry created with action: USER_ROLE_CHANGE.
The user can now sign in at /login and access the Admin Dashboard (/admin).
`);
  } catch (error) {
    console.error('\n\x1b[31m[ERROR]\x1b[0m An unexpected error occurred while executing the promotion:');
    console.error(error.message || error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
