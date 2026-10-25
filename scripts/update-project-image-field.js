const { sequelize } = require('../config/database');

async function updateProjectImageField() {
  try {
    console.log('🔄 Updating projects table image field...');
    
    // Alter the image column to allow NULL and change default
    await sequelize.query(`
      ALTER TABLE projects 
      MODIFY COLUMN image VARCHAR(255) NULL DEFAULT ''
    `);
    
    console.log('✅ Successfully updated projects table image field');
    console.log('   - Image field now allows NULL');
    console.log('   - Default value changed to empty string');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating projects table:', error);
    process.exit(1);
  }
}

updateProjectImageField();
