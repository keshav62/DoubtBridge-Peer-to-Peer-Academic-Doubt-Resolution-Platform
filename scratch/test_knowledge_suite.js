const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const {
  getKnowledgeResources,
  getKnowledgeResourceById,
  createKnowledgeResource,
  updateKnowledgeResource,
  deleteKnowledgeResource,
  incrementKnowledgeResourceViews,
  toggleResourceBookmark,
  getUserBookmarkedResources,
  getPendingKnowledgeResources,
  reviewKnowledgeResource,
  getRelatedKnowledgeResources,
  getKnowledgeSubjectsAndCounts,
} = require('../src/features/knowledge/service');

const {
  validateKnowledgeInput,
  validateReviewInput,
} = require('../src/features/knowledge/validation');

async function runTests() {
  console.log('=== RUNNING KNOWLEDGE HUB TEST SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // Fetch test users
  const student = await prisma.user.findUnique({ where: { id: 'seed-user-student-1' } });
  const student2 = await prisma.user.findUnique({ where: { id: 'seed-user-student-2' } });
  const helper1 = await prisma.user.findUnique({ where: { id: 'seed-user-helper-1' } });
  const mod = await prisma.user.findUnique({ where: { id: 'seed-user-mod-1' } });

  // 1. Validation tests
  console.log('--- 1. Input Validation Tests ---');
  const invalidShort = validateKnowledgeInput({ title: 'Hi', content: 'Short' });
  assert(!invalidShort.isValid, 'Rejects short title and content');
  assert(invalidShort.errors.length >= 3, 'Returns specific validation errors');

  const validData = validateKnowledgeInput({
    title: 'Valid Academic Article Title',
    subject: 'Computer Science',
    topic: 'Graph Algorithms',
    description: 'A valid description of the resource.',
    content: 'This is a sufficiently long content body that exceeds the minimum required characters for submission.',
    status: 'PENDING',
  });
  assert(validData.isValid, 'Accepts valid academic resource payload');

  // 2. Public resource listing & search
  console.log('\n--- 2. Resource Listing & Filtering ---');
  const publicList = await getKnowledgeResources({ user: student });
  assert(publicList.resources.length >= 5, `Fetched ${publicList.resources.length} public resources`);
  const allApproved = publicList.resources.every(r => r.status === 'APPROVED');
  assert(allApproved, 'Public feed only displays APPROVED resources');

  const csList = await getKnowledgeResources({ subject: 'Data Structures & Algorithms', user: student });
  assert(csList.resources.length > 0, 'Filters resources by subject');
  assert(csList.resources.every(r => r.subject === 'Data Structures & Algorithms'), 'All filtered items match subject');

  const searchList = await getKnowledgeResources({ q: 'PostgreSQL', user: student });
  assert(searchList.resources.length > 0, 'Keyword search matches PostgreSQL article');
  assert(searchList.resources.some(r => r.title.includes('PostgreSQL')), 'Search returns matching title');

  // 3. Subject counts
  console.log('\n--- 3. Subject Aggregation ---');
  const subjects = await getKnowledgeSubjectsAndCounts();
  assert(Array.isArray(subjects) && subjects.length > 0, `Aggregated ${subjects.length} academic subjects with approved content`);

  // 4. Resource creation & isolation
  console.log('\n--- 4. Resource Creation & Unpublished Isolation ---');
  const created = await createKnowledgeResource({
    title: 'Automated Test Resource - Deep Architecture',
    subject: 'Computer Science',
    topic: 'Testing & Verification',
    description: 'A thorough explanation of test verification in web architectures.',
    content: 'Detailed explanations of software verification methods and architectural consistency check patterns.',
    status: 'PENDING',
  }, student);

  assert(created.id && created.status === 'PENDING', 'Created new pending resource by student');

  // Verify other student cannot see unpublished item
  let unauthorizedBlocked = false;
  try {
    await getKnowledgeResourceById(created.id, student2);
  } catch (err) {
    unauthorizedBlocked = err.statusCode === 403;
  }
  assert(unauthorizedBlocked, 'Blocks unauthorized users from reading PENDING resource');

  // Verify author can read their own pending item
  const authorRead = await getKnowledgeResourceById(created.id, student);
  assert(authorRead.id === created.id, 'Author can read their own unpublished resource');

  // 5. Author editing & authorization
  console.log('\n--- 5. Edit Authorization ---');
  let nonAuthorEditBlocked = false;
  try {
    await updateKnowledgeResource(created.id, { title: 'Hacked Title' }, student2);
  } catch (err) {
    nonAuthorEditBlocked = err.statusCode === 403;
  }
  assert(nonAuthorEditBlocked, 'Prevents non-author from editing content');

  const updated = await updateKnowledgeResource(created.id, {
    title: 'Updated Test Resource - Formal Architecture',
    topic: 'Formal Methods',
  }, student);
  assert(updated.title === 'Updated Test Resource - Formal Architecture', 'Author can update their own resource');

  // 6. Moderation review
  console.log('\n--- 6. Moderation Review Workflow ---');
  const pendingQueue = await getPendingKnowledgeResources(mod);
  assert(pendingQueue.resources.some(r => r.id === created.id), 'Pending queue contains newly submitted resource');

  let studentModerationBlocked = false;
  try {
    await reviewKnowledgeResource(created.id, { decision: 'APPROVED' }, student);
  } catch (err) {
    studentModerationBlocked = err.statusCode === 403;
  }
  assert(studentModerationBlocked, 'Students cannot approve/review resources');

  // Author self-review check
  const authorMod = await prisma.user.findUnique({ where: { id: 'seed-user-helper-1' } });
  // Helper 1 has an existing pending resource: seed-res-6
  let selfReviewBlocked = false;
  try {
    await reviewKnowledgeResource('seed-res-6', { decision: 'APPROVED' }, authorMod);
  } catch (err) {
    selfReviewBlocked = err.statusCode === 403;
  }
  assert(selfReviewBlocked, 'Authors cannot approve their own submissions');

  // Moderator approves created resource
  const approved = await reviewKnowledgeResource(created.id, { decision: 'APPROVED' }, mod);
  assert(approved.status === 'APPROVED', 'Moderator successfully approved resource');

  // Now student2 can read it
  const publicRead = await getKnowledgeResourceById(created.id, student2);
  assert(publicRead.id === created.id, 'Approved resource is now accessible to all students');

  // 7. Bookmarking System
  console.log('\n--- 7. Bookmarking System ---');
  const bmResult1 = await toggleResourceBookmark(created.id, student2);
  assert(bmResult1.bookmarked === true, 'Successfully added bookmark');

  const userBookmarks = await getUserBookmarkedResources(student2);
  assert(userBookmarks.resources.some(r => r.id === created.id), 'Bookmarked resource appears in user saved list');

  const readWithBm = await getKnowledgeResourceById(created.id, student2);
  assert(readWithBm.isBookmarked === true, 'Resource detail accurately reflects isBookmarked: true');

  const bmResult2 = await toggleResourceBookmark(created.id, student2);
  assert(bmResult2.bookmarked === false, 'Successfully removed bookmark on second toggle');

  // 8. Related Articles & View Count
  console.log('\n--- 8. Related Resources & Views ---');
  const related = await getRelatedKnowledgeResources(created.id);
  assert(Array.isArray(related), 'Returns related resources array');
  assert(!related.some(r => r.id === created.id), 'Related resources excludes current resource');

  const initialViews = approved.views;
  await incrementKnowledgeResourceViews(created.id);
  const afterView = await prisma.knowledgeResource.findUnique({ where: { id: created.id } });
  assert(afterView.views === initialViews + 1, 'Increments view count atomically');

  // 9. Cleanup
  console.log('\n--- 9. Cleanup ---');
  await deleteKnowledgeResource(created.id, student);
  const deletedCheck = await prisma.knowledgeResource.findUnique({ where: { id: created.id } });
  assert(!deletedCheck, 'Successfully deleted test resource');

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
}

runTests().catch(console.error).finally(() => prisma.$disconnect());

