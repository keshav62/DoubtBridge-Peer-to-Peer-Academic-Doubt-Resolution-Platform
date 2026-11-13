/**
 * migrate-passwords.js
 * ────────────────────
 * Sets a bcrypt password hash on all existing seeded users who have
 * no passwordHash yet.  Run once after deploying Task 7.
 *
 * Dev password for ALL seeded users: Demo@2026
 *
 * Usage:
 *   node prisma/migrate-passwords.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const DEV_PASSWORD = 'Demo@2026';

async function main() {
  console.log('🔐 Migrating seeded user passwords...');

  const SALT_ROUNDS = 12;
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, SALT_ROUNDS);

  const result = await prisma.user.updateMany({
    where: { passwordHash: null },
    data: { passwordHash },
  });

  console.log(`✅ Updated ${result.count} users with passwordHash.`);
  console.log(`   Dev login password for all seeded accounts: ${DEV_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

