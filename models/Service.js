const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  icon: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: '',
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING(1000),
    allowNull: true,
    defaultValue: '',
  },
  imageAlt: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: '',
  },
  points: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  detailIntro: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  detailDescription: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  outcomes: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_published',
  },
}, {
  tableName: 'services',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Service;
