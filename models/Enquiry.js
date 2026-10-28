const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Enquiry = sequelize.define('Enquiry', {
  id:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:    { type: DataTypes.STRING(255), allowNull: false },
  email:   { type: DataTypes.STRING(255), allowNull: false },
  phone:   { type: DataTypes.STRING(20),  allowNull: true  },
  subject: { type: DataTypes.STRING(255), allowNull: false },
  message: { type: DataTypes.TEXT,        allowNull: false },
  status:  { type: DataTypes.ENUM('New','Read','Replied','Closed'), defaultValue: 'New' },
  careerId:    { type: DataTypes.INTEGER, allowNull: true  },
  careerTitle: { type: DataTypes.STRING(255), allowNull: true },
  resourceId:  { type: DataTypes.STRING(255), allowNull: true },
  resourceTitle: { type: DataTypes.STRING(255), allowNull: true },
  resourceType: { type: DataTypes.STRING(20), allowNull: true, field: 'resource_type' },
  type:        { type: DataTypes.ENUM('General','Career','Resource'), defaultValue: 'General' },
}, {
  tableName: 'enquiries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Enquiry;
