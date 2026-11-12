const http = require('http');

async function testEndpoints() {
  console.log('=== VERIFYING KNOWLEDGE ENDPOINTS DIRECTLY VIA DATABASE & FEATURE SERVICE ===');

  const {
    getKnowledgeResources,
    getKnowledgeResourceById,
    getUserBookmarkedResources,
    getKnowledgeSubjectsAndCounts,
    getRelatedKnowledgeResources,
  } = require('../src/features/knowledge/service');

  const { prisma } = require('../src/lib/prisma');

  const admin = await prisma.user.findUnique({ where: { id: 'seed-user-admin-1' } });
  const student = await prisma.user.findUnique({ where: { id: 'seed-user-student-1' } });

  // 1. Check getKnowledgeResources
  const allRes = await getKnowledgeResources({ user: student, limit: 10 });
  console.log(`✓ Fetched ${allRes.resources.length} resources (Total: ${allRes.pagination.total})`);

  // 2. Check getKnowledgeSubjectsAndCounts
  const subjects = await getKnowledgeSubjectsAndCounts();
  console.log(`✓ Subject counts:`, subjects.map(s => `${s.subject}: ${s.count}`).join(', '));

  // 3. Check getKnowledgeResourceById
  const single = await getKnowledgeResourceById('seed-res-1', student);
  console.log(`✓ Fetched single resource: "${single.title}" by ${single.author.name} (Views: ${single.views})`);

  // 4. Check getRelatedKnowledgeResources
  const related = await getRelatedKnowledgeResources('seed-res-1', { limit: 3 });
  console.log(`✓ Related articles for seed-res-1: ${related.length} found`);

  // 5. Check bookmarks
  const bms = await getUserBookmarkedResources(student);
  console.log(`✓ Student bookmarks count: ${bms.resources.length}`);

  console.log('\nALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
  await prisma.$disconnect();
}

testEndpoints().catch(console.error);

