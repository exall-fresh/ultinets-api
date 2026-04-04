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

  // Create sample services (40% of frontend services)
  const techConsultingService = await prisma.service.upsert({
    where: { slug: 'technology-consulting' },
    update: {},
    create: {
      slug: 'technology-consulting',
      serviceName: 'Technology Management & Transformation Consulting',
      description: 'We help organizations navigate digital transformation by leveraging cutting-edge technologies like cloud computing, AI, and 5G to drive growth and innovation.',
      fullDescription: 'Our technology consulting services help organizations navigate digital transformation by leveraging cutting-edge technologies like cloud computing, AI, and 5G to drive growth and innovation. We provide comprehensive digital strategy development, agile implementation, and data analytics integration.',
      icon: 'rocket',
      category: 'Consulting Services',
      metaTitle: 'Technology Consulting Services | Ultinets',
      metaDescription: 'Digital transformation consulting with cutting-edge technologies.',
      published: true,
      publishedAt: new Date(),
      order: 1,
      createdById: admin.id,
      updatedById: admin.id,
    },
  });
  console.log('✅ Created technology consulting service');

  const networkDesignService = await prisma.service.upsert({
    where: { slug: 'network-design' },
    update: {},
    create: {
      slug: 'network-design',
      serviceName: 'Intelligent Network Design & Management',
      description: 'Our network design and management services ensure your infrastructure is secure, scalable, and optimized for performance with robust business-critical application support.',
      fullDescription: 'Our intelligent network design and management services ensure your infrastructure is secure, scalable, and optimized for performance. We provide custom network design, security management, and ongoing monitoring and optimization.',
      icon: 'network',
      category: 'Infrastructure Services',
      metaTitle: 'Network Design & Management | Ultinets',
      metaDescription: 'Secure, scalable network infrastructure design and management.',
      published: true,
      publishedAt: new Date(),
      order: 2,
      createdById: admin.id,
      updatedById: admin.id,
    },
  });
  console.log('✅ Created network design service');

  const ruralConnectivityService = await prisma.service.upsert({
    where: { slug: 'rural-connectivity' },
    update: {},
    create: {
      slug: 'rural-connectivity',
      serviceName: 'Rural Connectivity',
      description: 'We\'re committed to bridging the digital divide by leveraging innovative technologies like satellite internet, 5G, and LPWAN to bring reliable connectivity to underserved communities.',
      fullDescription: 'We\'re committed to bridging the digital divide by leveraging innovative technologies like satellite internet, 5G, and LPWAN to bring reliable connectivity to underserved communities. Our solutions include satellite-based connectivity, community network design, and digital literacy training.',
      icon: 'satellite',
      category: 'Connectivity Solutions',
      metaTitle: 'Rural Connectivity Solutions | Ultinets',
      metaDescription: 'Bridging the digital divide with innovative connectivity solutions.',
      published: true,
      publishedAt: new Date(),
      order: 3,
      createdById: admin.id,
      updatedById: admin.id,
    },
  });
  console.log('✅ Created rural connectivity service');

  const webDevelopmentService = await prisma.service.upsert({
    where: { slug: 'web-development' },
    update: {},
    create: {
      slug: 'web-development',
      serviceName: 'Web Development',
      description: 'We build modern, responsive websites that drive results.',
      fullDescription: 'We build modern, responsive websites that drive results. Our web development services include responsive design, SEO optimization, and performance-focused solutions.',
      icon: 'rocket',
      category: 'Technology Solutions',
      metaTitle: 'Web Development Services | Ultinets',
      metaDescription: 'Modern, responsive websites that drive results.',
      published: true,
      publishedAt: new Date(),
      order: 4,
      createdById: admin.id,
      updatedById: admin.id,
    },
  });
  console.log('✅ Created web development service');

  const cloudSolutionsService = await prisma.service.upsert({
    where: { slug: 'cloud-solutions' },
    update: {},
    create: {
      slug: 'cloud-solutions',
      serviceName: 'Cloud Solutions',
      description: 'Scalable cloud infrastructure for your growing business.',
      fullDescription: 'Scalable cloud infrastructure for your growing business. Our cloud solutions include auto scaling, 99.9% uptime guarantee, and enterprise-grade security.',
      icon: 'network',
      category: 'Infrastructure Services',
      metaTitle: 'Cloud Solutions | Ultinets',
      metaDescription: 'Scalable cloud infrastructure for growing businesses.',
      published: true,
      publishedAt: new Date(),
      order: 5,
      createdById: admin.id,
      updatedById: admin.id,
    },
  });
  console.log('✅ Created cloud solutions service');

  // Create service details
  await prisma.serviceDetail.createMany({
    skipDuplicates: true,
    data: [
      { serviceId: techConsultingService.id, keyFeature: 'Digital Strategy Development', description: 'Comprehensive digital transformation planning', order: 1 },
      { serviceId: techConsultingService.id, keyFeature: 'Agile & DevOps Implementation', description: 'Modern development methodologies', order: 2 },
      { serviceId: techConsultingService.id, keyFeature: 'Data Analytics & AI Integration', description: 'Intelligent data-driven solutions', order: 3 },
      { serviceId: networkDesignService.id, keyFeature: 'Custom Network Design', description: 'Tailored network architecture', order: 1 },
      { serviceId: networkDesignService.id, keyFeature: 'Network Security & Threat Management', description: 'Comprehensive security solutions', order: 2 },
      { serviceId: networkDesignService.id, keyFeature: 'Ongoing Monitoring & Optimization', description: 'Continuous performance improvement', order: 3 },
      { serviceId: ruralConnectivityService.id, keyFeature: 'Satellite-based Solutions', description: 'High-speed satellite internet', order: 1 },
      { serviceId: ruralConnectivityService.id, keyFeature: 'Community Network Design', description: 'Local network infrastructure', order: 2 },
      { serviceId: ruralConnectivityService.id, keyFeature: 'Digital Literacy Training', description: 'Community education programs', order: 3 },
      { serviceId: webDevelopmentService.id, keyFeature: 'Responsive Design', description: 'Mobile-first approach for all devices', order: 1 },
      { serviceId: webDevelopmentService.id, keyFeature: 'SEO Optimized', description: 'Built for search engine visibility', order: 2 },
      { serviceId: webDevelopmentService.id, keyFeature: 'Performance Focused', description: 'Fast loading and optimized code', order: 3 },
      { serviceId: cloudSolutionsService.id, keyFeature: 'Auto Scaling', description: 'Automatic resource adjustment', order: 1 },
      { serviceId: cloudSolutionsService.id, keyFeature: '99.9% Uptime', description: 'Reliable service availability', order: 2 },
      { serviceId: cloudSolutionsService.id, keyFeature: 'Security First', description: 'Enterprise-grade protection', order: 3 },
    ],
  });
  console.log('✅ Created service details');

  // Create About sections
  const missionSection = await prisma.aboutSection.upsert({
    where: { section: 'mission' },
    update: {},
    create: {
      section: 'mission',
      title: 'Our Mission',
      content: 'As a global society, our ability to effect positive change in our community can no longer be the result of new technologies alone. Instead, it will depend on our capacity to place those technologies into the hands of a greater proportion of our community.\n\nUltiNetS is dedicated to this mission. We are all about people, technology, and social empowerment. We design the ultimate transport infrastructure and enabling services for our clients to communicate and transfer technology effectively.',
      published: true,
      order: 1,
      createdById: admin.id,
      updatedById: admin.id,
    },
  });

  const approachSection = await prisma.aboutSection.upsert({
    where: { section: 'approach' },
    update: {},
    create: {
      section: 'approach',
      title: 'Our Approach',
      content: 'Built on three foundational pillars that guide everything we do',
      published: true,
      order: 2,
      createdById: admin.id,
      updatedById: admin.id,
    },
  });

  const impactSection = await prisma.aboutSection.upsert({
    where: { section: 'impact' },
    update: {},
    create: {
      section: 'impact',
      title: 'Our Impact',
      content: 'Measuring our success through meaningful metrics',
      published: true,
      order: 3,
      createdById: admin.id,
      updatedById: admin.id,
    },
  });
  console.log('✅ Created about sections');

  // Create approach pillars
  await prisma.aboutPillar.createMany({
    skipDuplicates: true,
    data: [
      {
        sectionId: approachSection.id,
        title: 'People First',
        description: 'We believe that technology must serve people, not the other way around. Our customers aren\'t just users—they\'re partners who can become shareholders and influence how we operate. We ensure every person we touch has access to the best possible services.',
        icon: 'users',
        order: 1,
      },
      {
        sectionId: approachSection.id,
        title: 'Social Responsibility',
        description: 'We operate with unwavering commitment to social responsibility. Our goal is to ensure that our customers use our technology services to lead fulfilling lives. We don\'t just provide services—we empower communities to thrive.',
        icon: 'heart',
        order: 2,
      },
      {
        sectionId: approachSection.id,
        title: 'Sustainable Growth',
        description: 'Sustainability across environmental, cultural, social, and economic dimensions is key to our success. We build solutions that create lasting impact, ensuring our work creates value for generations to come.',
        icon: 'target',
        order: 3,
      },
    ],
  });
  console.log('✅ Created approach pillars');

  // Create impact stats
  await prisma.aboutStat.createMany({
    skipDuplicates: true,
    data: [
      {
        sectionId: impactSection.id,
        label: 'Impact Driven',
        value: '100%',
        icon: 'target',
        order: 1,
      },
      {
        sectionId: impactSection.id,
        label: 'Service Areas',
        value: '5+',
        icon: 'zap',
        order: 2,
      },
      {
        sectionId: impactSection.id,
        label: 'Years Experience',
        value: '10+',
        icon: 'rocket',
        order: 3,
      },
      {
        sectionId: impactSection.id,
        label: 'Communities Served',
        value: '∞',
        icon: 'globe',
        order: 4,
      },
    ],
  });
  console.log('✅ Created impact stats');

  // Create sample team members (40% of frontend team)
  await prisma.teamMember.createMany({
    skipDuplicates: true,
    data: [
      {
        firstName: 'Thomas',
        lastName: 'Zgambo',
        position: 'Chief Executive Officer',
        email: 'thomas.zgambo@ultinets.net',
        phone: '+265 (0)999 410 763',
        bio: 'Leading UltiNetS with a passion for technology-driven social impact.',
        published: true,
        order: 1,
        createdById: admin.id,
        updatedById: admin.id,
      },
      {
        firstName: 'Richard',
        lastName: 'Chisala',
        position: 'Chief Operations Officer',
        email: 'richard.chisala@ultinets.net',
        phone: '+265 (0)999 410 763',
        bio: 'Ensuring smooth operations and scalable growth across all initiatives.',
        published: true,
        order: 2,
        createdById: admin.id,
        updatedById: admin.id,
      },
    ],
  });
  console.log('✅ Created team members');

  // Create sample partners (40% of frontend partners)
  await prisma.partner.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Microsoft',
        description: 'Leading technology solutions provider',
        website: 'https://microsoft.com',
        category: 'Technology',
        logo: '/partners/microsoft-logo-png-2396.png',
        published: true,
        order: 1,
        createdById: admin.id,
        updatedById: admin.id,
      },
      {
        name: 'Motorola',
        description: 'Communications and technology solutions',
        website: 'https://motorola.com',
        category: 'Communications',
        logo: '/partners/motorola-seeklogo.png',
        published: true,
        order: 2,
        createdById: admin.id,
        updatedById: admin.id,
      },
      {
        name: 'Cisco',
        description: 'Networking and cybersecurity solutions',
        website: 'https://cisco.com',
        category: 'Networking',
        logo: '/partners/CSCO.png',
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