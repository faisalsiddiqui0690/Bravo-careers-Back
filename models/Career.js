const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Career = sequelize.define('Career', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title:       { type: DataTypes.STRING(255), allowNull: false },
  department:  { type: DataTypes.STRING(100), allowNull: false },
  location:    { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'United Kingdom' },
  type:        { type: DataTypes.ENUM('Full-Time','Part-Time','Internship','Remote'), allowNull: false, defaultValue: 'Full-Time' },
  experience:  { type: DataTypes.STRING(50),  allowNull: false, defaultValue: '0-1 years' },
  description: { type: DataTypes.TEXT,        allowNull: false },
  requirements:{ type: DataTypes.TEXT,        allowNull: true  },
  isActive:    { type: DataTypes.BOOLEAN,     defaultValue: true },
}, {
  tableName: 'careers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Career;
