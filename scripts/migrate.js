const mysql = require('mysql2/promise');
const { sequelize } = require('../config/database');
const { Project, Service, Review, SiteAnalytics, Career, Enquiry } = require('../models');
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
    
    // Seed initial data if tables are empty
    const projectCount = await Project.count();
    if (projectCount === 0) {
      console.log('🌱 Seeding initial projects...');
      await Project.bulkCreate([
        { id: 1, title: "E-Commerce Platform", category: "Web Development", client: "Fashion Retail Company", description: "Complete e-commerce solution with inventory management, payment processing, and real-time analytics.", technologies: ["React", "Node.js", "MongoDB", "Stripe"], image: "🛒" },
        { id: 2, title: "Mobile Banking App", category: "App Development", client: "FinTech Startup", description: "Secure mobile banking application with biometric authentication and real-time transactions.", technologies: ["React Native", "Firebase", "Node.js", "Blockchain"], image: "📱" },
        { id: 3, title: "CRM System", category: "Enterprise Software", client: "B2B Services Company", description: "Custom CRM solution with lead management and automated workflows.", technologies: ["Vue.js", "Python", "PostgreSQL", "Docker"], image: "📊" },
        { id: 4, title: "Healthcare Portal", category: "Web Development", client: "Medical Clinic", description: "Patient management system with appointment scheduling and telemedicine capabilities.", technologies: ["Angular", "Express.js", "MySQL", "WebRTC"], image: "🏥" },
        { id: 5, title: "Logistics Dashboard", category: "Data Analytics", client: "Logistics Company", description: "Real-time tracking dashboard with route optimization and predictive analytics.", technologies: ["React", "Python", "TensorFlow", "AWS"], image: "🚚" },
        { id: 6, title: "Social Media App", category: "App Development", client: "Tech Startup", description: "Social networking platform with real-time messaging, content sharing, and live streaming.", technologies: ["Flutter", "Node.js", "Socket.io", "AWS"], image: "💬" }
      ]);
      console.log('✅ Projects seeded successfully!');
    }
    
    const serviceCount = await Service.count();
    if (serviceCount === 0) {
      console.log('🌱 Seeding initial services...');
      await Service.bulkCreate([
        { id: 1, icon: '🌐', title: 'Web Development', description: 'Beautiful, high-performing websites that turn visitors into customers. Custom design and development with modern tech stack.' },
        { id: 2, icon: '📱', title: 'App Development', description: 'Native and cross-platform apps that users love. iOS, Android, and cloud integration with real-time synchronization.' },
        { id: 3, icon: '🛒', title: 'E-Commerce Management', description: 'End-to-end e-commerce solutions that boost sales and reduce operational friction. Platform setup and payment integration.' },
        { id: 4, icon: '📊', title: 'CRM Implementation', description: 'Streamlined CRM solutions that unify your customer data and accelerate sales. Custom workflows and team training.' },
        { id: 5, icon: '⚙️', title: 'IT Infrastructure', description: 'On-premise & cloud solutions for modern businesses. Scalable infrastructure designed for enterprise needs.' },
        { id: 6, icon: '🔐', title: 'Cybersecurity', description: 'Protection & compliance for your digital assets. Security audits, threat mitigation, and continuous monitoring.' }
      ]);
      console.log('✅ Services seeded successfully!');
    }
    
    const reviewCount = await Review.count();
    if (reviewCount === 0) {
      console.log('🌱 Seeding initial reviews...');
      await Review.bulkCreate([
        { id: 1, name: "Sarah Johnson", role: "CEO, Tech Startup", rating: 5, comment: "IP Technology delivered an exceptional e-commerce platform that exceeded our expectations. The team was professional, responsive, and delivered on time." },
        { id: 2, name: "Michael Chen", role: "Marketing Director, Retail Company", rating: 5, comment: "Our new website has transformed our online presence. The mobile app they built is intuitive and our customers love it." },
        { id: 3, name: "Emily Rodriguez", role: "Product Manager, SaaS Company", rating: 5, comment: "Outstanding development work! They understood our complex requirements and delivered a scalable solution that grows with our business." },
        { id: 4, name: "David Kim", role: "Founder, Healthcare Startup", rating: 5, comment: "Professional team with excellent communication. They delivered our CRM system on budget and it works flawlessly." },
        { id: 5, name: "Lisa Thompson", role: "Operations Manager, Logistics Company", rating: 5, comment: "The custom dashboard they built has streamlined our operations. Incredible attention to detail and follow-up support." },
        { id: 6, name: "James Wilson", role: "CTO, FinTech Company", rating: 5, comment: "Technical excellence combined with business understanding. They delivered a complex financial application that our users love." }
      ]);
      console.log('✅ Reviews seeded successfully!');
    }

    // ── Seed Analytics ────────────────────────────────────────
    const analyticsCount = await SiteAnalytics.count();
    if (analyticsCount === 0) {
      console.log('🌱 Seeding initial analytics...');
      await SiteAnalytics.create({
        projectsCount: '150+', clientsCount: '50+', statesCount: '15+', clientRate: '98%',
        projectsChange: '+12%', clientsChange: '+8%', statesChange: '+3',
        webPct: 72, appPct: 55, crmPct: 38,
        monthlyData: '30,50,38,70,55,85,62,90,72,95,80,100',
        activityTitle: 'E-Commerce Platform launched',
        activitySub: 'Fashion Retail Co. · just now',
      });
      console.log('✅ Analytics seeded successfully!');
    }
    
    console.log('\n🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Allow running directly (node scripts/migrate.js) OR importing from index.js
if (require.main === module) {
  const { sequelize: db } = require('../config/database');
  migrate().then(() => db.close()).catch(() => process.exit(1));
}

module.exports = migrate;
