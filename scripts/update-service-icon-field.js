const { sequelize } = require('../config/database');

async function updateServiceIconField() {
  try {
    console.log('🔄 Updating services table icon field...');
    
    // Alter the icon column to allow NULL and change default
    await sequelize.query(`
      ALTER TABLE services 
      MODIFY COLUMN icon VARCHAR(255) NULL DEFAULT ''
    `);
    
    console.log('✅ Successfully updated services table icon field');
    console.log('   - Icon field now allows NULL');
    console.log('   - Default value changed to empty string');
    console.log('   - Field length increased to 255 characters');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating services table:', error);
    process.exit(1);
  }
}

updateServiceIconField();
