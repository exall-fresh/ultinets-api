import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  console.log('🧹 Cleaning up duplicate about data...\n');

  // Delete duplicate pillars (keep the first one of each title per section)
  const pillars = await prisma.aboutPillar.findMany({
    orderBy: { id: 'asc' },
  });

  const seenPillars = new Set();
  const pillarsToDelete = [];

  for (const pillar of pillars) {
    const key = `${pillar.sectionId}-${pillar.title}`;
    if (seenPillars.has(key)) {
      pillarsToDelete.push(pillar.id);
    } else {
      seenPillars.add(key);
    }
  }

  if (pillarsToDelete.length > 0) {
    await prisma.aboutPillar.deleteMany({
      where: { id: { in: pillarsToDelete } },
    });
    console.log(`✅ Deleted ${pillarsToDelete.length} duplicate pillars`);
  } else {
    console.log('✅ No duplicate pillars found');
  }

  // Delete duplicate stats (keep the first one of each label per section)
  const stats = await prisma.aboutStat.findMany({
    orderBy: { id: 'asc' },
  });

  const seenStats = new Set();
  const statsToDelete = [];

  for (const stat of stats) {
    const key = `${stat.sectionId}-${stat.label}`;
    if (seenStats.has(key)) {
      statsToDelete.push(stat.id);
    } else {
      seenStats.add(key);
    }
  }

  if (statsToDelete.length > 0) {
    await prisma.aboutStat.deleteMany({
      where: { id: { in: statsToDelete } },
    });
    console.log(`✅ Deleted ${statsToDelete.length} duplicate stats`);
  } else {
    console.log('✅ No duplicate stats found');
  }

  console.log('\n✨ Cleanup completed!');
}

cleanupDuplicates()
  .catch((e) => {
    console.error('❌ Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
