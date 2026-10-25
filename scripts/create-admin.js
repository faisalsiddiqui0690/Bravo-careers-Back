const AdminUser = require('../models/AdminUser');
const { sequelize } = require('../config/database');
const { Role } = require('../utils/rbac');

async function createInitialAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync the AdminUser model
    await AdminUser.sync({ force: true });
    console.log('✅ AdminUser table created');

    // Check if any admin exists
    const existingAdmin = await AdminUser.findOne();
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      return;
    }

    // Create initial super admin
    const admin = await AdminUser.create({
      email: 'admin@iptechnologies.in',
      password: 'Admin@123456',
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
      isActive: true
    });

    console.log('✅ Initial admin created successfully:');
    console.log('   Email:', admin.email);
    console.log('   Password: Admin@123456');
    console.log('   Role:', admin.role);
    console.log('\n⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await sequelize.close();
  }
}

createInitialAdmin();
