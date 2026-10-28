const AdminUser = require('../models/AdminUser');
const { sequelize } = require('../config/database');
const bootstrapSuperAdmin = require('./bootstrapSuperAdmin');

async function createInitialAdmin() {
  try {
    if (!process.env.SUPER_ADMIN_EMAIL) {
      throw new Error('Set SUPER_ADMIN_EMAIL before creating the initial admin.');
    }

    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    await AdminUser.sync();

    await bootstrapSuperAdmin();

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

createInitialAdmin();
