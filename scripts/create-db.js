const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  try {
    const databaseName = process.env.DB_NAME || 'bravo_careers';
    if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
      throw new Error('DB_NAME may contain only letters, numbers and underscores');
    }
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    console.log(`✅ Database "${databaseName}" created successfully!`);
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create database:', error.message);
    process.exit(1);
  }
}

createDatabase();
