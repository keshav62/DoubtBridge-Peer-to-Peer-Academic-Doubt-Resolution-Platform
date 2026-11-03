import { PrismaClient } from '@prisma/client';

if (typeof window !== 'undefined') {
  throw new Error('Prisma client cannot be executed in the browser. Database access is server-only.');
}

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
