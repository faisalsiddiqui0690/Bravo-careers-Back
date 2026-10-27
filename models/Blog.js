const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Blog = sequelize.define('Blog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  category: { type: DataTypes.STRING(120), allowNull: false, defaultValue: 'Career guidance' },
  excerpt: { type: DataTypes.TEXT, allowNull: false },
  content: { type: DataTypes.TEXT('long'), allowNull: false },
  image: { type: DataTypes.STRING(1000), allowNull: true, defaultValue: '' },
  imageAlt: { type: DataTypes.STRING(255), allowNull: true, defaultValue: '' },
  isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_published' },
  publishedAt: { type: DataTypes.DATE, allowNull: true, field: 'published_at' },
}, {
  tableName: 'blogs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Blog;
