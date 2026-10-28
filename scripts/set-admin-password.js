require('dotenv').config();

const { sequelize } = require('../config/database');
const AdminUser = require('../models/AdminUser');
const { Role } = require('../utils/rbac');

async function setAdminPassword() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.ADMIN_NEW_PASSWORD;
  if (!email || !password) {
    throw new Error('SUPER_ADMIN_EMAIL and ADMIN_NEW_PASSWORD are required.');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_NEW_PASSWORD must be at least 12 characters long.');
  }

  try {
    await sequelize.authenticate();
    const admin = await AdminUser.findOne({ where: { email, role: Role.SUPER_ADMIN } });
    if (!admin) {
      throw new Error(`No super admin exists for ${email}. Run the migration and verify SUPER_ADMIN_EMAIL first.`);
    }

    admin.password = password;
    await admin.save();
    console.log(`✅ Password updated for the super admin account ${email}.`);
  } finally {
    await sequelize.close();
  }
}

setAdminPassword().catch((error) => {
  console.error('❌ Could not update super admin password:', error.message);
  process.exitCode = 1;
});
