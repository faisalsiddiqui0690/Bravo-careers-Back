const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Resource = sequelize.define('Resource', {
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('free', 'ebooks'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  sections: {
    type: DataTypes.JSON,
    allowNull: false,
    get() {
      const sections = this.getDataValue('sections');
      if (typeof sections !== 'string') return sections;

      const parsed = JSON.parse(sections);
      return Array.isArray(parsed) ? parsed : sections;
    },
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_published',
  },
}, {
  tableName: 'resources',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Resource;
