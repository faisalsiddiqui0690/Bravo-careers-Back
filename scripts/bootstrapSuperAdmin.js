const crypto = require('crypto');
const AdminUser = require('../models/AdminUser');
const { Role } = require('../utils/rbac');

async function bootstrapSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  if (!email) {
    console.warn('⚠️  SUPER_ADMIN_EMAIL is not set; no super admin was created.');
    return;
  }

  const existingAdmin = await AdminUser.findOne({ where: { email } });
  if (existingAdmin) {
    console.log(`ℹ️  Super admin account ${email} already exists, skipping.`);
    return;
  }

  const existingSuperAdmin = await AdminUser.findOne({ where: { role: Role.SUPER_ADMIN } });
  if (existingSuperAdmin) {
    console.warn('⚠️  A super admin already exists; no additional super admin was created.');
    return;
  }

  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;
  const temporaryPassword = initialPassword || crypto.randomBytes(24).toString('hex');
  await AdminUser.create({
    email,
    password: temporaryPassword,
    firstName: 'adminbravocareers',
    role: Role.SUPER_ADMIN,
    isActive: true,
  });

  console.log('\n✅ Bravo Careers super admin created.');
  console.log(`   Name: adminbravocareers`);
  console.log(`   Email: ${email}`);
  if (initialPassword) {
    console.log('   An initial password from the process environment was used.');
  } else {
    console.log(`   Temporary password (shown once): ${temporaryPassword}`);
    console.log('   Change this password after your first login.\n');
  }
}

module.exports = bootstrapSuperAdmin;
