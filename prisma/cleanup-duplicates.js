import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  console.log('🧹 Cleaning up duplicate data...\n');

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

  // Delete duplicate partners (keep the first one of each name)
  const partners = await prisma.partner.findMany({
    orderBy: { id: 'asc' },
  });

  const seenPartners = new Set();
  const partnersToDelete = [];

  for (const partner of partners) {
    const key = partner.name.toLowerCase();
    if (seenPartners.has(key)) {
      partnersToDelete.push(partner.id);
    } else {
      seenPartners.add(key);
    }
  }

  if (partnersToDelete.length > 0) {
    await prisma.partner.deleteMany({
      where: { id: { in: partnersToDelete } },
    });
    console.log(`✅ Deleted ${partnersToDelete.length} duplicate partners`);
  } else {
    console.log('✅ No duplicate partners found');
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
