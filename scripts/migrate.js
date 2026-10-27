const mysql = require('mysql2/promise');
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');
const { Service, Blog, News } = require('../models');
const AdminUser = require('../models/AdminUser');
const { Role } = require('../utils/rbac');

const DB_NAME = process.env.DB_NAME || 'iptechnologies';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = parseInt(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASSWORD || '';

const migrate = async () => {
  try {
    // ── Step 1: Create database if it doesn't exist ───────────
    console.log(`🔄 Ensuring database "${DB_NAME}" exists...`);
    const conn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASS,
    });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    await conn.end();
    console.log(`✅ Database "${DB_NAME}" ready.`);

    console.log('🔄 Starting database migration...');
    
    // Create tables
    await sequelize.sync({ force: false });
    await ensureBravoContentColumns();
    console.log('✅ Database tables created successfully!');

    // ── Seed Super Admin ──────────────────────────────────────
    const adminExists = await AdminUser.findOne({ where: { email: 'admin@iptechnologies.in' } });
    if (!adminExists) {
      console.log('🌱 Seeding super admin...');
      await AdminUser.create({
        email: 'admin@iptechnologies.in',
        password: 'Admin@123456',
        firstName: 'Super',
        lastName: 'Admin',
        role: Role.SUPER_ADMIN,
        isActive: true,
      });
      console.log('✅ Super admin created!');
      console.log('   Email   : admin@iptechnologies.in');
      console.log('   Password: Admin@123456');
    } else {
      console.log('ℹ️  Super admin already exists, skipping.');
    }
    
    await seedBravoServices();
    await seedBravoEditorial();

    console.log('\n🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

const seedBravoEditorial = async () => {
  const blogEntries = [
    {
      slug: 'build-a-focused-uk-job-search-plan',
      title: 'Build a focused UK job-search plan',
      category: 'Career planning',
      excerpt: 'Choose roles that fit your experience, check sponsorship requirements early and make each application purposeful.',
      content: 'Start by identifying roles that match your skills and experience rather than applying broadly. Research employers and check official sponsor information before investing time in an application.\n\nTailor your UK CV to each role, explain your impact with clear examples and prepare for UK-style interviews. Keep a simple tracker for applications, follow-ups and questions to research.\n\nNo job or sponsorship outcome can be guaranteed. Use official information and get regulated advice where your personal immigration circumstances require it.',
      image: '',
      imageAlt: 'UK job search planning',
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: 'make-your-experience-easy-to-understand',
      title: 'Make your experience easy to understand',
      category: 'CV & interviews',
      excerpt: 'Show the impact of your work with clear examples, relevant skills and a CV tailored to the role.',
      content: 'Recruiters need to understand quickly what you did, how you did it and what changed as a result. Use concise examples, relevant skills and outcomes that are accurate and easy to verify.\n\nRead the job description carefully, bring the most relevant experience forward and remove detail that does not support your application. Prepare interview examples that show your contribution and decision-making.',
      image: '',
      imageAlt: 'CV and interview preparation',
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: 'test-your-business-idea-before-you-invest',
      title: 'Test your business idea before you invest',
      category: 'Founder support',
      excerpt: 'Pressure-test the problem, customer need and growth potential before committing to a business plan.',
      content: 'Begin with the problem you want to solve and the people who experience it. Speak with potential customers, examine alternatives and look for evidence that your solution addresses a real need.\n\nA strong plan explains how the business could operate, what resources it needs and how it may grow. Gather evidence before making significant commitments, and seek qualified advice for legal, financial or immigration questions.',
      image: '',
      imageAlt: 'Founder developing a business idea',
      isPublished: true,
      publishedAt: new Date(),
    },
  ];

  const newsEntries = [
    {
      slug: 'check-the-latest-visa-requirements',
      title: 'Check the latest visa requirements',
      category: 'Skilled Worker route',
      excerpt: 'Review the official eligibility, salary and application guidance before making plans.',
      content: 'Visa requirements and guidance can change. Check the current eligibility criteria, salary requirements and application steps directly on GOV.UK before you make decisions.\n\nBravo Careers provides practical preparation and educational resources, not regulated immigration advice. For advice about your personal circumstances, consult an appropriately regulated adviser.',
      externalUrl: 'https://www.gov.uk/skilled-worker-visa',
      image: '',
      imageAlt: 'Official UK visa guidance',
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: 'search-current-uk-vacancies',
      title: 'Search current UK vacancies',
      category: 'UK job search',
      excerpt: 'Use the government job service to explore roles and prepare your next application.',
      content: 'The official Find a Job service lets you search for current vacancies across the UK. Review each role carefully and confirm the employer and job details before applying.\n\nFor roles where sponsorship may matter, research employer information using official sources and check that the position fits your experience.',
      externalUrl: 'https://www.gov.uk/find-a-job',
      image: '',
      imageAlt: 'UK job search information',
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: 'read-the-official-founder-visa-guidance',
      title: 'Read the official founder visa guidance',
      category: 'Innovator Founder route',
      excerpt: 'Check the current rules and endorsement information directly with GOV.UK.',
      content: 'If you are exploring the Innovator Founder route, begin with the current official guidance and review how the endorsement process works.\n\nThe route has specific requirements and decisions are made by the relevant endorsing bodies and authorities. Bravo Careers can help organise business-plan preparation, but does not provide regulated immigration advice or guarantee an outcome.',
      externalUrl: 'https://www.gov.uk/innovator-founder-visa',
      image: '',
      imageAlt: 'Innovator Founder route information',
      isPublished: true,
      publishedAt: new Date(),
    },
  ];

  for (const entry of blogEntries) {
    if (!(await Blog.findOne({ where: { slug: entry.slug } }))) await Blog.create(entry);
  }
  for (const entry of newsEntries) {
    if (!(await News.findOne({ where: { slug: entry.slug } }))) await News.create(entry);
  }
};

const ensureBravoContentColumns = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const additions = {
    services: {
      slug: { type: DataTypes.STRING(255), allowNull: true },
      image: { type: DataTypes.STRING(1000), allowNull: true, defaultValue: '' },
      imageAlt: { type: DataTypes.STRING(255), allowNull: true, defaultValue: '' },
      points: { type: DataTypes.JSON, allowNull: true },
      detailIntro: { type: DataTypes.TEXT, allowNull: true },
      detailDescription: { type: DataTypes.TEXT('long'), allowNull: true },
      outcomes: { type: DataTypes.JSON, allowNull: true },
      is_published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    reviews: {
      is_published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      image: { type: DataTypes.STRING(1000), allowNull: true, defaultValue: '' },
      permission_granted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
  };

  for (const [table, columns] of Object.entries(additions)) {
    const existing = await queryInterface.describeTable(table);
    for (const [column, definition] of Object.entries(columns)) {
      if (!existing[column]) await queryInterface.addColumn(table, column, definition);
    }
  }

  const indexes = await queryInterface.showIndex('services');
  if (!indexes.some((index) => index.name === 'services_slug_unique')) {
    await queryInterface.addIndex('services', ['slug'], { name: 'services_slug_unique', unique: true });
  }
};

const seedBravoServices = async () => {
  const entries = [
    {
      slug: 'sponsored-job-recruitment', title: 'Sponsored job recruitment', icon: 'Briefcase',
      description: 'Focused recruitment support for candidates exploring UK roles with sponsorship potential.',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=85',
      imageAlt: 'London skyline and the River Thames',
      points: ['Role and employer research', 'UK CV and interview preparation', 'No job or sponsorship guarantees'],
      detailIntro: 'A focused job search for roles and employers that may fit your skills and sponsorship needs.',
      detailDescription: 'We help you identify suitable opportunities, prepare clear applications and check employer information using official sources. Hiring and sponsorship decisions are made by employers, and no job offer or sponsorship outcome can be guaranteed.',
      outcomes: ['Identify roles that match your experience and goals', 'Learn how to check employer and sponsorship information', 'Strengthen your UK CV and interview preparation', 'Build a practical plan for your next applications'],
    },
    {
      slug: 'innovator-founder-visa', title: 'Innovator Founder visa', icon: 'Sparkles',
      description: 'Founder support to shape your business plan and understand the official endorsement process.',
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85',
      imageAlt: 'Founders working together around a table',
      points: ['Business-plan readiness', 'Official route information', 'Preparation for adviser or endorser discussions'],
      detailIntro: 'Turn your business idea into a clearer, evidence-led plan for your next conversation.',
      detailDescription: 'We help founders clarify their idea, organise a business plan and understand where to find official route information. Endorsement decisions belong to independent endorsing bodies. For immigration advice about your circumstances, consult an appropriately regulated adviser.',
      outcomes: ['Clarify the problem, customer and value proposition', 'Organise your business plan and supporting evidence', 'Prepare questions for an endorsing body or regulated adviser', 'Understand that endorsement and visa outcomes are not guaranteed'],
    },
    {
      slug: 'student-visa', title: 'Student visa', icon: 'GraduationCap',
      description: 'Practical preparation support for students researching UK study and the official visa process.',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=85',
      imageAlt: 'University students walking across campus',
      points: ['Study-route planning', 'Document organisation', 'Signposting to official guidance and regulated advice'],
      detailIntro: 'Get organised as you explore studying in the UK and prepare for the next steps.',
      detailDescription: 'We can help you plan your research, organise questions and find official information about studying in the UK. We do not provide regulated immigration advice or make visa decisions; speak with an appropriately regulated adviser for advice about your circumstances.',
      outcomes: ['Map out study and preparation milestones', 'Create a checklist of information to confirm with your education provider', 'Find official guidance and identify questions for a regulated adviser', 'Keep your plans realistic, organised and evidence-led'],
    },
    {
      slug: 'business-visa', title: 'Business visa', icon: 'Building2',
      description: 'Support to research UK business-related routes and prepare questions for a regulated adviser.',
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85',
      imageAlt: 'Business professionals discussing plans around a table',
      points: ['Business goals and route research', 'Planning and document organisation', 'Regulated adviser signposting'],
      detailIntro: 'Start with a clear picture of your UK business plans and the information you need to verify.',
      detailDescription: 'We help you organise your business objectives, research official information and prepare for conversations with a regulated immigration adviser. UK business-related routes have different requirements, and we cannot recommend a visa route or guarantee an outcome.',
      outcomes: ['Set out your business objectives and intended activities', 'Identify official information relevant to your research', 'Prepare focused questions for an appropriately regulated adviser', 'Understand that eligibility and application decisions are made by the relevant authorities'],
    },
    {
      slug: 'uk-sponsor-licence', title: 'UK Sponsor Licence', icon: 'ShieldCheck',
      description: 'Preparation support for employers learning about sponsor licence responsibilities and requirements.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=85',
      imageAlt: 'Professional reviewing business documents',
      points: ['Business readiness planning', 'Document and process organisation', 'Official guidance signposting'],
      detailIntro: 'Help your organisation prepare to understand the responsibilities involved in sponsoring workers.',
      detailDescription: 'We help employers organise their preparation, review publicly available guidance and identify questions about their processes. The Home Office decides sponsor licence applications. We do not provide legal advice or guarantee that an application will be approved.',
      outcomes: ['Understand the broad responsibilities described in official guidance', 'Organise company information and preparation tasks', 'Identify process questions to raise with a qualified professional', 'Plan next steps without assuming an application outcome'],
    },
    {
      slug: 'global-talent-visa', title: 'Global Talent visa', icon: 'Globe2',
      description: 'Preparation support to organise your achievements and research the official Global Talent route.',
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85',
      imageAlt: 'Professionals collaborating on a project',
      points: ['Evidence organisation', 'Official route research', 'Preparation for specialist advice'],
      detailIntro: 'Present your professional achievements clearly as you explore the Global Talent route.',
      detailDescription: 'We can help you organise your career evidence and research official route information. Endorsement and visa decisions are made by the relevant bodies and authorities. For advice on your eligibility or application, consult an appropriately regulated adviser.',
      outcomes: ['Create a clear record of relevant achievements and evidence', 'Research the official route and relevant endorsing body information', 'Prepare questions for a regulated adviser or specialist', 'Understand that endorsement and visa outcomes cannot be guaranteed'],
    },
  ];

  for (const entry of entries) {
    if (await Service.findOne({ where: { slug: entry.slug } })) continue;
    await Service.create({ ...entry, isPublished: true });
  }
};

// Allow running directly (node scripts/migrate.js) OR importing from index.js
if (require.main === module) {
  const { sequelize: db } = require('../config/database');
  migrate().then(() => db.close()).catch(() => process.exit(1));
}

module.exports = migrate;
