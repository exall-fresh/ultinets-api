import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ultinets.com' },
    update: {},
    create: {
      email: 'admin@ultinets.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
    },
  });
  console.log('✅ Created admin user: admin@ultinets.com / admin123');

  // Create editor user
  const editorPassword = await bcrypt.hash('editor123', 10);
  const editor = await prisma.user.upsert({
    where: { email: 'editor@ultinets.com' },
    update: {},
    create: {
      email: 'editor@ultinets.com',
      password: editorPassword,
      firstName: 'Editor',
      lastName: 'User',
      role: 'editor',
      status: 'active',
    },
  });
  console.log('✅ Created editor user: editor@ultinets.com / editor123');

  // Create sample services
  const webDevService = await prisma.service.upsert({
    where: { slug: 'web-development' },
    update: {},
    create: {
      slug: 'web-development',
      serviceName: 'Web Development',
      description: 'We build modern, responsive websites that drive results.',
      fullDescription: 'Our web development team creates stunning, high-performance websites tailored to your business needs.',
      icon: 'code',
      metaTitle: 'Web Development Services | Ultinets',
      metaDescription: 'Professional web development services for modern businesses.',
      published: true,
      publishedAt: new Date(),
      order: 1,
      createdById: admin.id,
      updatedById: admin.id,
    },
  });
  console.log('✅ Created web development service');

  const cloudService = await prisma.service.upsert({
    where: { slug: 'cloud-solutions' },
    update: {},
    create: {
      slug: 'cloud-solutions',
      serviceName: 'Cloud Solutions',
      description: 'Scalable cloud infrastructure for your growing business.',
      fullDescription: 'Migrate to the cloud with our expert team. We provide secure, scalable cloud solutions.',
      icon: 'cloud',
      metaTitle: 'Cloud Solutions | Ultinets',
      metaDescription: 'Secure and scalable cloud infrastructure services.',
      published: true,
      publishedAt: new Date(),
      order: 2,
      createdById: admin.id,
      updatedById: admin.id,
    },
  });
  console.log('✅ Created cloud solutions service');

  // Create service details
  await prisma.serviceDetail.createMany({
    skipDuplicates: true,
    data: [
      { serviceId: webDevService.id, keyFeature: 'Responsive Design', description: 'Mobile-first approach', order: 1 },
      { serviceId: webDevService.id, keyFeature: 'SEO Optimized', description: 'Built for search engines', order: 2 },
      { serviceId: webDevService.id, keyFeature: 'Fast Loading', description: 'Optimized performance', order: 3 },
      { serviceId: cloudService.id, keyFeature: 'Auto Scaling', description: 'Scale automatically', order: 1 },
      { serviceId: cloudService.id, keyFeature: '99.9% Uptime', description: 'High availability', order: 2 },
    ],
  });
  console.log('✅ Created service details');

  // Create sample team members
  await prisma.teamMember.createMany({
    skipDuplicates: true,
    data: [
      {
        firstName: 'John',
        lastName: 'Smith',
        position: 'CEO',
        email: 'john.smith@ultinets.com',
        bio: 'John has over 15 years of experience in technology leadership.',
        published: true,
        order: 1,
        createdById: admin.id,
        updatedById: admin.id,
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        position: 'Lead Developer',
        email: 'sarah.j@ultinets.com',
        bio: 'Sarah is a full-stack developer with a passion for clean code.',
        published: true,
        order: 2,
        createdById: admin.id,
        updatedById: admin.id,
      },
      {
        firstName: 'Mike',
        lastName: 'Williams',
        position: 'Designer',
        email: 'mike.w@ultinets.com',
        bio: 'Mike creates beautiful, user-centered designs.',
        published: true,
        order: 3,
        createdById: admin.id,
        updatedById: admin.id,
      },
    ],
  });
  console.log('✅ Created team members');

  // Create sample partners
  await prisma.partner.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'TechCorp',
        description: 'Leading technology solutions provider',
        website: 'https://techcorp.com',
        category: 'Technology',
        published: true,
        order: 1,
        createdById: admin.id,
        updatedById: admin.id,
      },
      {
        name: 'CloudSystems',
        description: 'Enterprise cloud infrastructure',
        website: 'https://cloudsystems.io',
        category: 'Cloud',
        published: true,
        order: 2,
        createdById: admin.id,
        updatedById: admin.id,
      },
      {
        name: 'DesignStudio',
        description: 'Creative design agency',
        website: 'https://designstudio.com',
        category: 'Design',
        published: true,
        order: 3,
        createdById: admin.id,
        updatedById: admin.id,
      },
    ],
  });
  console.log('✅ Created partners');

  // Create default settings
  await prisma.setting.createMany({
    skipDuplicates: true,
    data: [
      { key: 'siteName', value: 'Ultinets', type: 'string', updatedById: admin.id },
      { key: 'siteDescription', value: 'Technology Solutions for Modern Businesses', type: 'string', updatedById: admin.id },
      { key: 'contactEmail', value: 'contact@ultinets.com', type: 'string', updatedById: admin.id },
      { key: 'contactPhone', value: '+1 (555) 123-4567', type: 'string', updatedById: admin.id },
      { key: 'address', value: '123 Tech Street, Silicon Valley, CA 94000', type: 'text', updatedById: admin.id },
      { key: 'enableContactForm', value: 'true', type: 'boolean', updatedById: admin.id },
    ],
  });
  console.log('✅ Created default settings');

  // Create sample contact submission
  await prisma.contactSubmission.create({
    data: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1 (555) 987-6543',
      subject: 'Service Inquiry',
      message: 'I am interested in your web development services. Please contact me.',
      service: 'web-development',
      status: 'new',
    },
  });
  console.log('✅ Created sample contact submission');

  console.log('\n✨ Database seeding completed!');
  console.log('\nYou can now login with:');
  console.log('  Admin: admin@ultinets.com / admin123');
  console.log('  Editor: editor@ultinets.com / editor123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });