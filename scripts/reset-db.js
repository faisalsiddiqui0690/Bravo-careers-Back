require('dotenv').config();

const mysql = require('mysql2/promise');
const databaseName = process.env.DB_NAME || 'bravo_careers';

async function resetDatabase() {
  if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
    throw new Error('DB_NAME may contain only letters, numbers and underscores');
  }
  if (databaseName !== 'bravo_careers' || process.env.RESET_DATABASE !== databaseName) {
    throw new Error('Refusing to reset. Set DB_NAME and RESET_DATABASE to bravo_careers explicitly.');
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    console.warn(`⚠️  Dropping database "${databaseName}" and all of its data.`);
    await connection.query(`DROP DATABASE IF EXISTS \`${databaseName}\``);
    await connection.query(`CREATE DATABASE \`${databaseName}\``);
  } finally {
    await connection.end();
  }

  await require('./migrate')();
}

resetDatabase().catch((error) => {
  console.error('❌ Database reset failed:', error);
  process.exitCode = 1;
});
