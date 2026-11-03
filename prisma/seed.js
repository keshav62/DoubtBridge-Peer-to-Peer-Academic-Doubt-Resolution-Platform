const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting DoubtBridge Database Seeding ---');

  // Production safety guard
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PROD_SEED) {
    console.error('Seeding is aborted: NODE_ENV is set to production without ALLOW_PROD_SEED.');
    process.exit(1);
  }

  // 1. Seed Users (1 Admin, 2 Moderators, 5 Helpers, 8 Students)
  console.log('Seeding Users...');
  const usersData = [
    // Admin
    {
      id: 'seed-user-admin-1',
      name: 'System Admin',
      email: 'admin@example.com',
      role: 'ADMIN',
      department: 'Computer Science & Engineering',
      academicYear: 'Faculty',
      reputation: 9999,
      isActive: true,
      isAvailable: false,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    // Moderators
    {
      id: 'seed-user-mod-1',
      name: 'Elena Vance',
      email: 'mod1@example.com',
      role: 'MODERATOR',
      department: 'Software Engineering',
      academicYear: 'Senior Staff',
      reputation: 3500,
      isActive: true,
      isAvailable: true,
      subjects: 'Data Structures,Algorithms,React,Databases',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    },
    {
      id: 'seed-user-mod-2',
      name: 'Marcus Chen',
      email: 'mod2@example.com',
      role: 'MODERATOR',
      department: 'Computer Systems',
      academicYear: 'Graduate Fellow',
      reputation: 2800,
      isActive: true,
      isAvailable: true,
      subjects: 'Operating Systems,Computer Networks,C++',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    // Peer Helpers
    {
      id: 'seed-user-helper-1',
      name: 'Dr. Priya Sharma',
      email: 'helper1@example.com',
      role: 'HELPER',
      department: 'Computer Science',
      academicYear: 'PhD Candidate',
      reputation: 1850,
      isActive: true,
      isAvailable: true,
      subjects: 'Data Structures,Algorithms,Graph Theory',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
    {
      id: 'seed-user-helper-2',
      name: 'Liam O\'Connor',
      email: 'helper2@example.com',
      role: 'HELPER',
      department: 'Software Engineering',
      academicYear: 'Year 4',
      reputation: 1420,
      isActive: true,
      isAvailable: true,
      subjects: 'JavaScript,React,TypeScript,Web Development',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
    {
      id: 'seed-user-helper-3',
      name: 'Sarah Jenkins',
      email: 'helper3@example.com',
      role: 'HELPER',
      department: 'Information Technology',
      academicYear: 'Year 4',
      reputation: 1260,
      isActive: true,
      isAvailable: true,
      subjects: 'Databases,PostgreSQL,SQL,Data Modeling',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    {
      id: 'seed-user-helper-4',
      name: 'Devon Brooks',
      email: 'helper4@example.com',
      role: 'HELPER',
      department: 'Computer Systems',
      academicYear: 'Year 3',
      reputation: 980,
      isActive: true,
      isAvailable: true,
      subjects: 'Operating Systems,Linux,C,Concurrency',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    },
    {
      id: 'seed-user-helper-5',
      name: 'Amina Khan',
      email: 'helper5@example.com',
      role: 'HELPER',
      department: 'Computer Science',
      academicYear: 'Year 4',
      reputation: 1150,
      isActive: true,
      isAvailable: true,
      subjects: 'Computer Networks,Security,TCP/IP,Sockets',
      avatarUrl: 'https://images.unsplash.com/photo-1534751516642-a171ed296996?w=150',
      avatar: 'https://images.unsplash.com/photo-1534751516642-a171ed296996?w=150',
    },
    // Students
    {
      id: 'seed-user-student-1',
      name: 'Alex Rivera',
      email: 'student1@example.com',
      role: 'STUDENT',
      department: 'Computer Science',
      academicYear: 'Year 2',
      reputation: 150,
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
    {
      id: 'seed-user-student-2',
      name: 'Rohan Mehta',
      email: 'student2@example.com',
      role: 'STUDENT',
      department: 'Information Technology',
      academicYear: 'Year 3',
      reputation: 210,
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150',
    },
    {
      id: 'seed-user-student-3',
      name: 'Chloe Zhao',
      email: 'student3@example.com',
      role: 'STUDENT',
      department: 'Software Engineering',
      academicYear: 'Year 2',
      reputation: 95,
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    },
    {
      id: 'seed-user-student-4',
      name: 'David Kim',
      email: 'student4@example.com',
      role: 'STUDENT',
      department: 'Computer Science',
      academicYear: 'Year 1',
      reputation: 40,
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    },
    {
      id: 'seed-user-student-5',
      name: 'Fatima Al-Mansoor',
      email: 'student5@example.com',
      role: 'STUDENT',
      department: 'Computer Science',
      academicYear: 'Year 3',
      reputation: 180,
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    },
    {
      id: 'seed-user-student-6',
      name: 'Lucas Silva',
      email: 'student6@example.com',
      role: 'STUDENT',
      department: 'Software Engineering',
      academicYear: 'Year 2',
      reputation: 110,
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    },
    {
      id: 'seed-user-student-7',
      name: 'Maya Patel',
      email: 'student7@example.com',
      role: 'STUDENT',
      department: 'Computer Engineering',
      academicYear: 'Year 4',
      reputation: 230,
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    },
    {
      id: 'seed-user-student-8',
      name: 'Ethan Taylor',
      email: 'student8@example.com',
      role: 'STUDENT',
      department: 'Information Systems',
      academicYear: 'Year 2',
      reputation: 75,
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: u,
      create: u,
    });
  }
  console.log(`✓ Seeded ${usersData.length} Users.`);

  // 2. Seed Helper Profiles for the 5 Helpers
  console.log('Seeding Helper Profiles...');
  const helperProfilesData = [
    {
      id: 'seed-hp-1',
      userId: 'seed-user-helper-1',
      bio: 'PhD candidate specializing in graph algorithms, complexity theory, and dynamic programming.',
      expertise: 'Algorithms, Graph Traversal, Bellman-Ford, Dynamic Programming',
      subjects: 'Data Structures,Algorithms,Discrete Mathematics',
      reputation: 1850,
      totalAnswers: 74,
      acceptedAnswers: 58,
      isAvailable: true,
    },
    {
      id: 'seed-hp-2',
      userId: 'seed-user-helper-2',
      bio: 'Full-stack engineering enthusiast focused on modern React concurrency, state management, and Node internals.',
      expertise: 'React, Next.js, JavaScript Event Loop, Async patterns',
      subjects: 'JavaScript,React,Web Development',
      reputation: 1420,
      totalAnswers: 56,
      acceptedAnswers: 43,
      isAvailable: true,
    },
    {
      id: 'seed-hp-3',
      userId: 'seed-user-helper-3',
      bio: 'Database engineer with deep interest in relational theory, indexing mechanisms, and query planning.',
      expertise: 'PostgreSQL, B-Tree Indexes, Query Optimization, Concurrency Control',
      subjects: 'Databases,SQL,PostgreSQL,Database Design',
      reputation: 1260,
      totalAnswers: 48,
      acceptedAnswers: 37,
      isAvailable: true,
    },
    {
      id: 'seed-hp-4',
      userId: 'seed-user-helper-4',
      bio: 'Systems programmer passionate about POSIX internals, memory management, and multi-threading.',
      expertise: 'Virtual Memory, Linux Kernel, Semaphores, Process Scheduling',
      subjects: 'Operating Systems,C,Linux,System Programming',
      reputation: 980,
      totalAnswers: 36,
      acceptedAnswers: 26,
      isAvailable: true,
    },
    {
      id: 'seed-hp-5',
      userId: 'seed-user-helper-5',
      bio: 'Network security researcher studying transport layer protocols, socket programming, and denial of service attacks.',
      expertise: 'TCP/IP, SYN Floods, Routing Protocols, Packet Analysis',
      subjects: 'Computer Networks,Network Security,Distributed Systems',
      reputation: 1150,
      totalAnswers: 41,
      acceptedAnswers: 32,
      isAvailable: true,
    },
  ];

  for (const hp of helperProfilesData) {
    await prisma.helperProfile.upsert({
      where: { userId: hp.userId },
      update: hp,
      create: hp,
    });
  }
  console.log(`✓ Seeded ${helperProfilesData.length} Helper Profiles.`);

  // 3. Seed Tags
  console.log('Seeding Tags...');
  const tagsList = [
    'dsa',
    'javascript',
    'react',
    'databases',
    'operating-systems',
    'computer-networks',
    'algorithms',
    'indexing',
    'concurrency',
    'memory-management',
    'protocols',
  ];

  for (const tagName of tagsList) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    });
  }
  console.log(`✓ Seeded ${tagsList.length} Tags.`);

  // 4. Seed Doubts (12 doubts across DSA, JS, React, Databases, OS, Computer Networks)
  console.log('Seeding Doubts...');
  const doubtsData = [
    {
      id: 'seed-doubt-1',
      title: 'How does Dijkstra algorithm handle negative weight cycles compared to Bellman-Ford?',
      description: 'I understand Dijkstra uses a greedy approach for shortest paths, but why does it produce incorrect results or loop infinitely when negative weights or negative cycles exist? How does Bellman-Ford detect negative cycles reliably?',
      subject: 'Data Structures & Algorithms',
      topic: 'Shortest Path Algorithms',
      difficulty: 'Intermediate',
      status: 'RESOLVED',
      priority: 'HIGH',
      urgency: 'HIGH',
      tags: 'dsa,algorithms,graphs,shortest-path',
      authorId: 'seed-user-student-1',
      studentId: 'seed-user-student-1',
      helperId: 'seed-user-helper-1',
      resolvedAt: new Date(Date.now() - 24 * 3600 * 1000),
    },
    {
      id: 'seed-doubt-2',
      title: 'Preventing infinite re-render loops in React useEffect with object dependencies',
      description: 'My component keeps re-rendering infinitely when passing an options object to useEffect dependency array. Even though the values inside the object do not change, React triggers the effect on every render. How can I fix this idiomatically in React 19?',
      subject: 'React',
      topic: 'Component Lifecycle & Hooks',
      difficulty: 'Intermediate',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      urgency: 'MEDIUM',
      tags: 'react,javascript,hooks,performance',
      authorId: 'seed-user-student-2',
      studentId: 'seed-user-student-2',
      helperId: 'seed-user-helper-2',
      resolvedAt: new Date(Date.now() - 48 * 3600 * 1000),
    },
    {
      id: 'seed-doubt-3',
      title: 'Why PostgreSQL chooses sequential scan instead of B-tree index on a composite column?',
      description: 'I created a composite index on (department_id, created_at). When running EXPLAIN ANALYZE on a query filtering on created_at alone, Postgres performs a sequential scan rather than using my index. Why does index column ordering matter so strictly in B-Trees?',
      subject: 'Databases',
      topic: 'PostgreSQL Indexing & Optimization',
      difficulty: 'Advanced',
      status: 'RESOLVED',
      priority: 'HIGH',
      urgency: 'HIGH',
      tags: 'databases,sql,indexing,postgresql',
      authorId: 'seed-user-student-3',
      studentId: 'seed-user-student-3',
      helperId: 'seed-user-helper-3',
      resolvedAt: new Date(Date.now() - 72 * 3600 * 1000),
    },
    {
      id: 'seed-doubt-4',
      title: 'Understanding Demand Paging and Major vs Minor Page Faults in Linux OS',
      description: 'Could someone clarify the exact OS steps during demand paging? What differentiates a minor page fault from a major page fault in the Linux kernel virtual memory subsystem?',
      subject: 'Operating Systems',
      topic: 'Virtual Memory & Demand Paging',
      difficulty: 'Intermediate',
      status: 'ASSIGNED',
      priority: 'MEDIUM',
      urgency: 'MEDIUM',
      tags: 'operating-systems,memory-management,linux,kernel',
      authorId: 'seed-user-student-4',
      studentId: 'seed-user-student-4',
      helperId: 'seed-user-helper-4',
    },
    {
      id: 'seed-doubt-5',
      title: 'Mitigating TCP SYN Flood attacks with SYN Cookies without allocating server TCB',
      description: 'During a TCP SYN flood attack, server memory is exhausted by half-open connections. How do SYN cookies encode connection parameters into the initial sequence number without allocating Transmission Control Blocks prematurely?',
      subject: 'Computer Networks',
      topic: 'Transport Layer Security',
      difficulty: 'Advanced',
      status: 'ANSWERED',
      priority: 'HIGH',
      urgency: 'HIGH',
      tags: 'computer-networks,protocols,tcp/ip,security',
      authorId: 'seed-user-student-5',
      studentId: 'seed-user-student-5',
      helperId: 'seed-user-helper-5',
    },
    {
      id: 'seed-doubt-6',
      title: 'Execution order of Microtasks vs Macrotasks in JavaScript Event Loop',
      description: 'If Promise.resolve().then() is queued alongside setTimeout(..., 0) and queueMicrotask(), in what precise order are they processed when the call stack clears?',
      subject: 'JavaScript',
      topic: 'Event Loop & Asynchronous Runtime',
      difficulty: 'Beginner',
      status: 'ANSWERED',
      priority: 'MEDIUM',
      urgency: 'MEDIUM',
      tags: 'javascript,concurrency,event-loop,async',
      authorId: 'seed-user-student-6',
      studentId: 'seed-user-student-6',
      helperId: 'seed-user-helper-2',
    },
    {
      id: 'seed-doubt-7',
      title: 'Red-Black tree deletion fixup: navigating double-black node cases',
      description: 'I am struggling to visualize Case 3 and Case 4 in Red-Black tree deletion when the sibling of the double-black node has black children vs red children. Can someone break down the rotation steps?',
      subject: 'Data Structures & Algorithms',
      topic: 'Self-Balancing Trees',
      difficulty: 'Advanced',
      status: 'OPEN',
      priority: 'HIGH',
      urgency: 'HIGH',
      tags: 'dsa,algorithms,trees,red-black',
      authorId: 'seed-user-student-7',
      studentId: 'seed-user-student-7',
    },
    {
      id: 'seed-doubt-8',
      title: 'ACID Isolation levels: Read Committed vs Repeatable Read vs Serializable',
      description: 'What practical anomalies are prevented by Repeatable Read in PostgreSQL that can still happen in Read Committed? How does Postgres Multi-Version Concurrency Control (MVCC) snapshot isolation affect this?',
      subject: 'Databases',
      topic: 'Transaction Concurrency & MVCC',
      difficulty: 'Intermediate',
      status: 'OPEN',
      priority: 'MEDIUM',
      urgency: 'MEDIUM',
      tags: 'databases,sql,concurrency,transactions',
      authorId: 'seed-user-student-8',
      studentId: 'seed-user-student-8',
    },
    {
      id: 'seed-doubt-9',
      title: 'Data serialization boundary between React Server Components and Client Components',
      description: 'Why cannot functions or non-serializable objects be passed as props across the RSC to Client Component boundary in Next.js? How does the React Flight protocol transmit props over the wire?',
      subject: 'React',
      topic: 'React Server Components Architecture',
      difficulty: 'Advanced',
      status: 'OPEN',
      priority: 'LOW',
      urgency: 'LOW',
      tags: 'react,javascript,architecture,nextjs',
      authorId: 'seed-user-student-1',
      studentId: 'seed-user-student-1',
    },
    {
      id: 'seed-doubt-10',
      title: 'Deadlock-free Dining Philosophers implementation using counting semaphores',
      description: 'In the classic Dining Philosophers problem, how can asymmetric pickup order or limiting concurrent seated diners with a semaphore mathematically prevent circular wait conditions?',
      subject: 'Operating Systems',
      topic: 'Deadlocks & Process Synchronization',
      difficulty: 'Intermediate',
      status: 'ASSIGNED',
      priority: 'MEDIUM',
      urgency: 'MEDIUM',
      tags: 'operating-systems,concurrency,deadlock,semaphores',
      authorId: 'seed-user-student-2',
      studentId: 'seed-user-student-2',
      helperId: 'seed-user-helper-4',
    },
    {
      id: 'seed-doubt-11',
      title: 'Iterative vs Recursive DNS query resolution and TTL caching hierarchy',
      description: 'What is the precise step-by-step traversal from the local stub resolver to the root nameservers, TLD nameservers, and authoritative servers during an uncached recursive DNS lookup?',
      subject: 'Computer Networks',
      topic: 'Application Layer DNS',
      difficulty: 'Beginner',
      status: 'OPEN',
      priority: 'LOW',
      urgency: 'LOW',
      tags: 'computer-networks,protocols,dns,caching',
      authorId: 'seed-user-student-3',
      studentId: 'seed-user-student-3',
    },
    {
      id: 'seed-doubt-12',
      title: 'Identifying JavaScript memory leaks caused by uncleaned event listeners and closures',
      description: 'How do detached DOM nodes retain references in the heap through closure scopes in single page applications, and what Chrome DevTools memory allocation timeline patterns reveal them?',
      subject: 'JavaScript',
      topic: 'Memory Profiling & Garbage Collection',
      difficulty: 'Intermediate',
      status: 'CLOSED',
      priority: 'LOW',
      urgency: 'LOW',
      tags: 'javascript,memory-management,performance,devtools',
      authorId: 'seed-user-student-4',
      studentId: 'seed-user-student-4',
      helperId: 'seed-user-helper-2',
      resolvedAt: new Date(Date.now() - 96 * 3600 * 1000),
    },
  ];

  for (const d of doubtsData) {
    await prisma.doubt.upsert({
      where: { id: d.id },
      update: d,
      create: d,
    });
  }
  console.log(`✓ Seeded ${doubtsData.length} Doubts.`);

  // 5. Link Doubts to Tags (DoubtTag)
  console.log('Seeding DoubtTags...');
  const tagMappings = [
    { doubtId: 'seed-doubt-1', tagName: 'dsa' },
    { doubtId: 'seed-doubt-1', tagName: 'algorithms' },
    { doubtId: 'seed-doubt-2', tagName: 'react' },
    { doubtId: 'seed-doubt-2', tagName: 'javascript' },
    { doubtId: 'seed-doubt-3', tagName: 'databases' },
    { doubtId: 'seed-doubt-3', tagName: 'indexing' },
    { doubtId: 'seed-doubt-4', tagName: 'operating-systems' },
    { doubtId: 'seed-doubt-4', tagName: 'memory-management' },
    { doubtId: 'seed-doubt-5', tagName: 'computer-networks' },
    { doubtId: 'seed-doubt-5', tagName: 'protocols' },
    { doubtId: 'seed-doubt-6', tagName: 'javascript' },
    { doubtId: 'seed-doubt-6', tagName: 'concurrency' },
    { doubtId: 'seed-doubt-7', tagName: 'dsa' },
    { doubtId: 'seed-doubt-7', tagName: 'algorithms' },
    { doubtId: 'seed-doubt-8', tagName: 'databases' },
    { doubtId: 'seed-doubt-8', tagName: 'concurrency' },
    { doubtId: 'seed-doubt-9', tagName: 'react' },
    { doubtId: 'seed-doubt-10', tagName: 'operating-systems' },
    { doubtId: 'seed-doubt-10', tagName: 'concurrency' },
    { doubtId: 'seed-doubt-11', tagName: 'computer-networks' },
    { doubtId: 'seed-doubt-12', tagName: 'javascript' },
  ];

  for (const mapping of tagMappings) {
    const tagRecord = await prisma.tag.findUnique({ where: { name: mapping.tagName } });
    if (tagRecord) {
      await prisma.doubtTag.upsert({
        where: { doubtId_tagId: { doubtId: mapping.doubtId, tagId: tagRecord.id } },
        update: {},
        create: {
          id: `seed-dt-${mapping.doubtId}-${tagRecord.id}`,
          doubtId: mapping.doubtId,
          tagId: tagRecord.id,
        },
      });
    }
  }
  console.log('✓ Linked Doubts to Tags.');

  // 6. Seed Doubt Assignments
  console.log('Seeding Doubt Assignments...');
  const assignmentsData = [
    {
      id: 'seed-assign-1',
      doubtId: 'seed-doubt-1',
      helperId: 'seed-user-helper-1',
      status: 'COMPLETED',
      assignedAt: new Date(Date.now() - 30 * 3600 * 1000),
      completedAt: new Date(Date.now() - 24 * 3600 * 1000),
    },
    {
      id: 'seed-assign-2',
      doubtId: 'seed-doubt-2',
      helperId: 'seed-user-helper-2',
      status: 'COMPLETED',
      assignedAt: new Date(Date.now() - 50 * 3600 * 1000),
      completedAt: new Date(Date.now() - 48 * 3600 * 1000),
    },
    {
      id: 'seed-assign-3',
      doubtId: 'seed-doubt-3',
      helperId: 'seed-user-helper-3',
      status: 'COMPLETED',
      assignedAt: new Date(Date.now() - 80 * 3600 * 1000),
      completedAt: new Date(Date.now() - 72 * 3600 * 1000),
    },
    {
      id: 'seed-assign-4',
      doubtId: 'seed-doubt-4',
      helperId: 'seed-user-helper-4',
      status: 'ACTIVE',
      assignedAt: new Date(Date.now() - 10 * 3600 * 1000),
    },
    {
      id: 'seed-assign-5',
      doubtId: 'seed-doubt-5',
      helperId: 'seed-user-helper-5',
      status: 'ACTIVE',
      assignedAt: new Date(Date.now() - 12 * 3600 * 1000),
    },
    {
      id: 'seed-assign-6',
      doubtId: 'seed-doubt-10',
      helperId: 'seed-user-helper-4',
      status: 'ACTIVE',
      assignedAt: new Date(Date.now() - 6 * 3600 * 1000),
    },
  ];

  for (const a of assignmentsData) {
    await prisma.doubtAssignment.upsert({
      where: { id: a.id },
      update: a,
      create: a,
    });
  }
  console.log(`✓ Seeded ${assignmentsData.length} Doubt Assignments.`);

  // 7. Seed Answers (Multiple answers, accepted, approved, pending, rejected)
  console.log('Seeding Answers...');
  const answersData = [
    // Doubt 1 answers
    {
      id: 'seed-ans-1',
      doubtId: 'seed-doubt-1',
      authorId: 'seed-user-helper-1',
      content: 'Dijkstra relies on a greedy invariant: once a vertex is settled from the priority queue, its shortest path is final. With negative edges, this premise fails because a longer path can later become shorter through a negative edge. Bellman-Ford relaxes all |V|-1 edges iteratively, and an extra |V|-th iteration detects if any distance can still decrease, proving a negative cycle exists.',
      status: 'APPROVED',
      isAccepted: true,
      upvotes: 28,
    },
    {
      id: 'seed-ans-2',
      doubtId: 'seed-doubt-1',
      authorId: 'seed-user-helper-3',
      content: 'Adding a constant offset to all edge weights to make them positive also does not fix Dijkstra! Because paths with more edges accumulate more offset penalties, altering the true shortest path. Bellman-Ford O(V*E) or Johnson algorithm for all-pairs are the mathematically correct choices.',
      status: 'APPROVED',
      isAccepted: false,
      upvotes: 14,
    },
    // Doubt 2 answers
    {
      id: 'seed-ans-3',
      doubtId: 'seed-doubt-2',
      authorId: 'seed-user-helper-2',
      content: 'In JavaScript, object literals recreate reference identity on every render: {} !== {}. In React, useEffect uses Object.is() shallow comparison on dependency items. Fix this by: 1) Moving the object inside the effect if it is only used there, 2) Memoizing with useMemo(() => ({ ... }), [primitiveDeps]), or 3) Deconstructing into primitive dependency keys.',
      status: 'APPROVED',
      isAccepted: true,
      upvotes: 22,
    },
    {
      id: 'seed-ans-4',
      doubtId: 'seed-doubt-2',
      authorId: 'seed-user-student-7',
      content: 'Just disable the eslint-disable-next-line react-hooks/exhaustive-deps rule and pass an empty array []. It stops the loop immediately.',
      status: 'REJECTED', // Rejected due to bad practice / suppressing linter incorrectly
      isAccepted: false,
      upvotes: 1,
    },
    // Doubt 3 answers
    {
      id: 'seed-ans-5',
      doubtId: 'seed-doubt-3',
      authorId: 'seed-user-helper-3',
      content: 'B-tree composite indexes sort first by column A, then within identical values of A by column B. If your query filters solely on created_at without specifying department_id, Postgres cannot traverse the B-tree hierarchically from the root. To support queries filtering only on created_at, create a standalone index on (created_at) or reorder to (created_at, department_id) depending on selectivity.',
      status: 'APPROVED',
      isAccepted: true,
      upvotes: 31,
    },
    {
      id: 'seed-ans-6',
      doubtId: 'seed-doubt-3',
      authorId: 'seed-user-student-8',
      content: 'Does vacuum analyze help Postgres re-evaluate table statistics so it decides to use the index anyway?',
      status: 'PENDING',
      isAccepted: false,
      upvotes: 2,
    },
    // Doubt 4 answers
    {
      id: 'seed-ans-7',
      doubtId: 'seed-doubt-4',
      authorId: 'seed-user-helper-4',
      content: 'A minor page fault occurs when the requested page is already resident in physical memory (RAM)—for example in the page cache or shared library space—so the kernel only needs to map the page table entry without disk I/O. A major page fault occurs when the page must be read from disk (swap or executable binary), which suspends the thread while waiting for block storage.',
      status: 'APPROVED',
      isAccepted: false,
      upvotes: 19,
    },
    {
      id: 'seed-ans-8',
      doubtId: 'seed-doubt-4',
      authorId: 'seed-user-student-2',
      content: 'I read somewhere that copy-on-write during fork() triggers minor page faults. Is that accurate?',
      status: 'PENDING',
      isAccepted: false,
      upvotes: 4,
    },
    // Doubt 5 answers
    {
      id: 'seed-ans-9',
      doubtId: 'seed-doubt-5',
      authorId: 'seed-user-helper-5',
      content: 'SYN Cookies eliminate the SYN queue backlog table entirely. The server creates an initial sequence number (ISN) containing a cryptographic hash of (Client IP, Client Port, Server IP, Server Port, Timestamp, and MSS index) with a secret key. When the client sends the final ACK acknowledging ISN+1, the server verifies the math. Only upon valid ACK verification does the server allocate the socket TCB in memory.',
      status: 'APPROVED',
      isAccepted: false,
      upvotes: 27,
    },
    {
      id: 'seed-ans-10',
      doubtId: 'seed-doubt-5',
      authorId: 'seed-user-student-4',
      content: 'Does SYN cookie usage disable TCP window scaling options in older implementations?',
      status: 'PENDING',
      isAccepted: false,
      upvotes: 3,
    },
    // Doubt 6 answers
    {
      id: 'seed-ans-11',
      doubtId: 'seed-doubt-6',
      authorId: 'seed-user-helper-2',
      content: 'The order is strictly: 1) Synchronous code executes to completion. 2) The entire Microtask queue is drained (Promise callbacks and queueMicrotask) before rendering or moving to the next task. 3) The browser can render. 4) The Macrotask queue yields one single task (such as setTimeout callback). Therefore, queueMicrotask and Promises execute BEFORE setTimeout.',
      status: 'APPROVED',
      isAccepted: false,
      upvotes: 18,
    },
    {
      id: 'seed-ans-12',
      doubtId: 'seed-doubt-6',
      authorId: 'seed-user-student-5',
      content: 'setTimeout always executes first because 0 ms means zero delay, so it enters the stack ahead of promises.',
      status: 'REJECTED', // Inaccurate explanation
      isAccepted: false,
      upvotes: 0,
    },
    // Doubt 10 answers
    {
      id: 'seed-ans-13',
      doubtId: 'seed-doubt-10',
      authorId: 'seed-user-helper-4',
      content: 'Deadlock in Dining Philosophers requires 4 Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. You can break circular wait by having one philosopher pick up their right fork first while the other 4 pick up their left fork first. Alternatively, use a counting semaphore initialized to N-1 (e.g. 4 for 5 philosophers) to prevent all 5 from picking up one fork simultaneously.',
      status: 'APPROVED',
      isAccepted: false,
      upvotes: 16,
    },
    // Doubt 12 answers
    {
      id: 'seed-ans-14',
      doubtId: 'seed-doubt-12',
      authorId: 'seed-user-helper-2',
      content: 'A classic pattern occurs when adding window.addEventListener("resize", handler) in a component without returning a cleanup function in useEffect. The global window object retains a reference to the handler, which closes over component state and props, preventing the entire virtual DOM subtree from being garbage collected when unmounted.',
      status: 'APPROVED',
      isAccepted: true,
      upvotes: 25,
    },
    {
      id: 'seed-ans-15',
      doubtId: 'seed-doubt-12',
      authorId: 'seed-user-student-6',
      content: 'Chrome DevTools heap snapshot comparison filter "Objects allocated between Snapshot 1 and 2" makes pinpointing these retained closures straightforward.',
      status: 'APPROVED',
      isAccepted: false,
      upvotes: 11,
    },
  ];

  for (const ans of answersData) {
    await prisma.answer.upsert({
      where: { id: ans.id },
      update: ans,
      create: ans,
    });
  }
  console.log(`✓ Seeded ${answersData.length} Answers.`);

  // 8. Seed Moderation Reviews
  console.log('Seeding Moderation Reviews...');
  const moderationReviewsData = [
    {
      id: 'seed-rev-1',
      answerId: 'seed-ans-1',
      reviewerId: 'seed-user-mod-1',
      decision: 'APPROVED',
      feedback: 'Excellent and precise technical explanation of greedy invariant vs Bellman-Ford edge relaxation.',
    },
    {
      id: 'seed-rev-2',
      answerId: 'seed-ans-3',
      reviewerId: 'seed-user-mod-1',
      decision: 'APPROVED',
      feedback: 'Clear, modern explanation of React reference identity and hook dependency best practices.',
    },
    {
      id: 'seed-rev-3',
      answerId: 'seed-ans-4',
      reviewerId: 'seed-user-mod-1',
      decision: 'REJECTED',
      feedback: 'Recommending suppressing linter rules without fixing the underlying state reference causes subtle stale-closure bugs. Answer rejected for academic rigor.',
    },
    {
      id: 'seed-rev-4',
      answerId: 'seed-ans-5',
      reviewerId: 'seed-user-mod-2',
      decision: 'APPROVED',
      feedback: 'Accurate description of composite index left-prefix requirement in PostgreSQL B-Trees.',
    },
    {
      id: 'seed-rev-5',
      answerId: 'seed-ans-7',
      reviewerId: 'seed-user-mod-2',
      decision: 'APPROVED',
      feedback: 'Accurate delineation between hardware page table fault handling and secondary storage access.',
    },
    {
      id: 'seed-rev-6',
      answerId: 'seed-ans-9',
      reviewerId: 'seed-user-mod-2',
      decision: 'APPROVED',
      feedback: 'Spot-on cryptographic summary of TCP SYN Cookie encoding mechanisms.',
    },
    {
      id: 'seed-rev-7',
      answerId: 'seed-ans-11',
      reviewerId: 'seed-user-mod-1',
      decision: 'APPROVED',
      feedback: 'Accurate differentiation between microtask queue flushing and macrotask dispatch.',
    },
    {
      id: 'seed-rev-8',
      answerId: 'seed-ans-12',
      reviewerId: 'seed-user-mod-1',
      decision: 'REJECTED',
      feedback: 'Technically incorrect statement regarding setTimeout priority over microtasks. Rejected to avoid student confusion.',
    },
  ];

  for (const rev of moderationReviewsData) {
    await prisma.moderationReview.upsert({
      where: { id: rev.id },
      update: rev,
      create: rev,
    });
  }
  console.log(`✓ Seeded ${moderationReviewsData.length} Moderation Reviews.`);

  // 9. Seed Knowledge Resources (5 Approved, 2 Pending, 1 Draft)
  console.log('Seeding Knowledge Resources...');
  const knowledgeResourcesData = [
    {
      id: 'seed-res-1',
      title: 'Comprehensive Guide to Graph Traversal Algorithms (BFS & DFS)',
      description: 'Detailed analysis of Breadth-First Search and Depth-First Search with complexity proofs, recursive vs iterative formulations, and topological sorting.',
      content: 'Graph traversal algorithms form the cornerstone of computer science... In BFS, a queue guarantees discovery order by distance... In DFS, backtrack mechanisms allow cycle detection in directed graphs.',
      subject: 'Data Structures & Algorithms',
      topic: 'Graph Theory',
      sourceUrl: 'https://doubtbridge.edu/resources/graph-traversals',
      authorId: 'seed-user-helper-1',
      status: 'APPROVED',
      views: 480,
    },
    {
      id: 'seed-res-2',
      title: 'React 19 Server Components Architecture Deep Dive',
      description: 'Understanding streaming SSR, zero-bundle-size server components, and the Flight protocol serialization mechanism.',
      content: 'Server Components execute exclusively on the server, generating a JSON-like stream known as the Flight format... Client components receive this stream and hydrate seamlessly.',
      subject: 'React',
      topic: 'Fullstack React Architecture',
      sourceUrl: 'https://doubtbridge.edu/resources/rsc-deep-dive',
      authorId: 'seed-user-helper-2',
      status: 'APPROVED',
      views: 615,
    },
    {
      id: 'seed-res-3',
      title: 'PostgreSQL Indexing Essentials & Query Optimization',
      description: 'Mastering B-Trees, GIN, BRIN indexes, EXPLAIN ANALYZE execution plan breakdown, and minimizing sequential scans.',
      content: 'An index is a separate data structure that trades write overhead for read speed. When Postgres scans a B-Tree, it traverses root to leaf in O(log N) block accesses...',
      subject: 'Databases',
      topic: 'Performance Tuning',
      sourceUrl: 'https://doubtbridge.edu/resources/postgres-indexing',
      authorId: 'seed-user-helper-3',
      status: 'APPROVED',
      views: 520,
    },
    {
      id: 'seed-res-4',
      title: 'Demystifying the Linux Virtual File System (VFS)',
      description: 'An architectural exploration of inodes, dentries, file objects, and mount points in the UNIX kernel.',
      content: 'The VFS abstraction layer provides standard POSIX syscalls (read, write, open) across diverse filesystems such as ext4, Btrfs, and network NFS...',
      subject: 'Operating Systems',
      topic: 'Kernel Subsystems',
      sourceUrl: 'https://doubtbridge.edu/resources/linux-vfs',
      authorId: 'seed-user-helper-4',
      status: 'APPROVED',
      views: 395,
    },
    {
      id: 'seed-res-5',
      title: 'TCP/IP Protocol Suite & Handshake Breakdown',
      description: 'An exhaustive walkthrough of sequence numbers, sliding windows, congestion control algorithms, and connection termination states.',
      content: 'TCP ensures ordered, reliable, byte-stream transmission across unreliable IP networks. Through the three-way handshake (SYN, SYN-ACK, ACK), both peers synchronize sequence numbers...',
      subject: 'Computer Networks',
      topic: 'Transport Layer Protocols',
      sourceUrl: 'https://doubtbridge.edu/resources/tcp-handshake',
      authorId: 'seed-user-helper-5',
      status: 'APPROVED',
      views: 440,
    },
    {
      id: 'seed-res-6',
      title: 'Zero-Knowledge Proofs in Distributed Academic Ledgers',
      description: 'Introduction to zk-SNARKs and cryptographic polynomial commitments for verifiable credential validation.',
      content: 'Zero-Knowledge Proofs enable a prover to demonstrate truth of a statement without leaking the underlying witness data...',
      subject: 'Computer Science',
      topic: 'Applied Cryptography',
      sourceUrl: null,
      authorId: 'seed-user-helper-1',
      status: 'PENDING',
      views: 45,
    },
    {
      id: 'seed-res-7',
      title: 'Modern CSS Container Queries & Architecture',
      description: 'Responsive modular UI design using component-level container queries over viewport media queries.',
      content: 'Container queries allow styling an element based on the dimensions of its parent container rather than viewport width...',
      subject: 'Web Development',
      topic: 'Frontend Design Systems',
      sourceUrl: null,
      authorId: 'seed-user-helper-2',
      status: 'PENDING',
      views: 32,
    },
    {
      id: 'seed-res-8',
      title: 'Advanced Dynamic Programming Patterns on Trees',
      description: 'Draft notes on tree rerooting techniques and centroid decomposition.',
      content: 'Tree DP involves computing subtree results recursively and aggregating at ancestor nodes...',
      subject: 'Data Structures & Algorithms',
      topic: 'Advanced Algorithms',
      sourceUrl: null,
      authorId: 'seed-user-helper-1',
      status: 'DRAFT',
      views: 0,
    },
  ];

  for (const kr of knowledgeResourcesData) {
    await prisma.knowledgeResource.upsert({
      where: { id: kr.id },
      update: kr,
      create: kr,
    });
  }
  console.log(`✓ Seeded ${knowledgeResourcesData.length} Knowledge Resources (5 Approved, 2 Pending, 1 Draft).`);

  // 10. Seed Knowledge Articles (for backward compatibility with existing feature services)
  console.log('Seeding Knowledge Articles (compatibility)...');
  const articlesData = [
    {
      id: 'seed-art-1',
      title: 'Mastering Asymptotic Notation (Big-O, Big-Theta, Big-Omega)',
      content: 'A comprehensive guide to understanding theoretical time and space complexity in algorithms...',
      subject: 'Computer Science',
      tags: 'algorithms,big-o,complexity',
      views: 342,
      authorId: 'seed-user-helper-1',
    },
    {
      id: 'seed-art-2',
      title: 'Modern React State Management: When to use Zustand vs Context',
      content: 'Context is designed for low-frequency updates like themes; external stores prevent unnecessary tree re-renders...',
      subject: 'Web Development',
      tags: 'react,javascript,state',
      views: 289,
      authorId: 'seed-user-helper-2',
    },
    {
      id: 'seed-art-3',
      title: 'Understanding Database Transactions and Isolation Levels',
      content: 'How relational databases guarantee ACID properties through Write-Ahead Logging (WAL) and MVCC...',
      subject: 'Databases',
      tags: 'databases,sql,acid',
      views: 198,
      authorId: 'seed-user-helper-3',
    },
  ];

  for (const art of articlesData) {
    await prisma.knowledgeArticle.upsert({
      where: { id: art.id },
      update: art,
      create: art,
    });
  }
  console.log(`✓ Seeded ${articlesData.length} Knowledge Articles.`);

  // 11. Seed Bookmarks
  console.log('Seeding Bookmarks...');
  const bookmarksData = [
    { id: 'seed-bm-1', userId: 'seed-user-student-1', doubtId: 'seed-doubt-3' },
    { id: 'seed-bm-2', userId: 'seed-user-student-1', doubtId: 'seed-doubt-5' },
    { id: 'seed-bm-3', userId: 'seed-user-student-2', doubtId: 'seed-doubt-1' },
    { id: 'seed-bm-4', userId: 'seed-user-student-3', doubtId: 'seed-doubt-2' },
    { id: 'seed-bm-5', userId: 'seed-user-student-4', doubtId: 'seed-doubt-1' },
    { id: 'seed-bm-6', userId: 'seed-user-student-5', doubtId: 'seed-doubt-4' },
    { id: 'seed-bm-7', userId: 'seed-user-student-6', doubtId: 'seed-doubt-2' },
    { id: 'seed-bm-8', userId: 'seed-user-student-7', doubtId: 'seed-doubt-6' },
    { id: 'seed-bm-9', userId: 'seed-user-student-8', doubtId: 'seed-doubt-3' },
    { id: 'seed-bm-10', userId: 'seed-user-student-8', doubtId: 'seed-doubt-10' },
  ];

  for (const bm of bookmarksData) {
    await prisma.bookmark.upsert({
      where: { userId_doubtId: { userId: bm.userId, doubtId: bm.doubtId } },
      update: {},
      create: bm,
    });
  }
  console.log(`✓ Seeded ${bookmarksData.length} Bookmarks.`);

  // 12. Seed Notifications
  console.log('Seeding Notifications...');
  const notificationsData = [
    {
      id: 'seed-notif-1',
      userId: 'seed-user-student-1',
      title: 'Doubt Resolved',
      message: 'Your doubt on "Dijkstra vs Bellman-Ford" was answered and resolved!',
      type: 'DOUBT_RESOLVED',
      isRead: true,
    },
    {
      id: 'seed-notif-2',
      userId: 'seed-user-student-2',
      title: 'New Answer Submitted',
      message: 'Liam O\'Connor submitted an answer for your React useEffect doubt.',
      type: 'ANSWER_SUBMITTED',
      isRead: true,
    },
    {
      id: 'seed-notif-3',
      userId: 'seed-user-student-3',
      title: 'Answer Accepted',
      message: 'Your accepted answer for PostgreSQL Indexing was credited 25 points!',
      type: 'DOUBT_RESOLVED',
      isRead: true,
    },
    {
      id: 'seed-notif-4',
      userId: 'seed-user-student-4',
      title: 'Doubt Claimed',
      message: 'Devon Brooks claimed your question on Linux Demand Paging.',
      type: 'DOUBT_CREATED',
      isRead: false,
    },
    {
      id: 'seed-notif-5',
      userId: 'seed-user-student-5',
      title: 'Answer Under Review',
      message: 'A peer answer on your TCP SYN Flood question was submitted for moderation.',
      type: 'ANSWER_SUBMITTED',
      isRead: false,
    },
    {
      id: 'seed-notif-6',
      userId: 'seed-user-helper-1',
      title: 'Moderation Decision',
      message: 'Your answer on Dijkstra was approved by moderator Elena Vance.',
      type: 'MODERATION_DECISION',
      isRead: true,
    },
    {
      id: 'seed-notif-7',
      userId: 'seed-user-helper-2',
      title: 'Reputation Bonus',
      message: 'Your answer was marked as accepted! +25 reputation points.',
      type: 'SYSTEM',
      isRead: false,
    },
    {
      id: 'seed-notif-8',
      userId: 'seed-user-helper-4',
      title: 'New Matching Doubt',
      message: 'A new high-priority Operating Systems doubt matches your expertise.',
      type: 'DOUBT_CREATED',
      isRead: false,
    },
    {
      id: 'seed-notif-9',
      userId: 'seed-user-student-7',
      title: 'Moderation Decision',
      message: 'Your answer on React hooks was rejected by moderator Elena Vance: "Recommending suppressing linter rules..."',
      type: 'MODERATION_DECISION',
      isRead: true,
    },
    {
      id: 'seed-notif-10',
      userId: 'seed-user-mod-1',
      title: 'New Answers to Moderate',
      message: '3 answers are currently awaiting moderation review in the queue.',
      type: 'SYSTEM',
      isRead: false,
    },
    {
      id: 'seed-notif-11',
      userId: 'seed-user-student-6',
      title: 'Welcome to DoubtBridge',
      message: 'Welcome to DoubtBridge! Ask your academic questions or browse peer answers.',
      type: 'SYSTEM',
      isRead: true,
    },
    {
      id: 'seed-notif-12',
      userId: 'seed-user-student-8',
      title: 'Weekly Digest',
      message: '5 new database articles were approved in the Knowledge Hub this week.',
      type: 'SYSTEM',
      isRead: false,
    },
  ];

  for (const n of notificationsData) {
    await prisma.notification.upsert({
      where: { id: n.id },
      update: n,
      create: n,
    });
  }
  console.log(`✓ Seeded ${notificationsData.length} Notifications.`);

  // 13. Seed Reports (for moderation triage testing)
  console.log('Seeding Reports (compatibility)...');
  const reportsData = [
    {
      id: 'seed-rep-1',
      reason: 'Low quality answer suggesting suppressing linter warnings without addressing root cause.',
      status: 'REVIEWED',
      reporterId: 'seed-user-student-2',
      doubtId: 'seed-doubt-2',
      answerId: 'seed-ans-4',
    },
    {
      id: 'seed-rep-2',
      reason: 'Inaccurate explanation regarding microtask execution order.',
      status: 'REVIEWED',
      reporterId: 'seed-user-student-6',
      doubtId: 'seed-doubt-6',
      answerId: 'seed-ans-12',
    },
    {
      id: 'seed-rep-3',
      reason: 'Question might be a duplicate of an existing Dijkstra algorithm thread.',
      status: 'PENDING',
      reporterId: 'seed-user-student-8',
      doubtId: 'seed-doubt-1',
      answerId: null,
    },
  ];

  for (const r of reportsData) {
    await prisma.report.upsert({
      where: { id: r.id },
      update: r,
      create: r,
    });
  }
  console.log(`✓ Seeded ${reportsData.length} Reports.`);

  console.log('\n--- Seeding Successfully Completed! ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
