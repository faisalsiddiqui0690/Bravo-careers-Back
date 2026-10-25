const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SiteAnalytics = sequelize.define('SiteAnalytics', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // KPI cards shown in hero dashboard
  projectsCount: { type: DataTypes.STRING(20), allowNull: false, defaultValue: '150+' },
  clientsCount:  { type: DataTypes.STRING(20), allowNull: false, defaultValue: '50+'  },
  statesCount:   { type: DataTypes.STRING(20), allowNull: false, defaultValue: '15+'  },
  clientRate:    { type: DataTypes.STRING(10), allowNull: false, defaultValue: '98%'  },

  // KPI change badges
  projectsChange: { type: DataTypes.STRING(10), allowNull: false, defaultValue: '+12%' },
  clientsChange:  { type: DataTypes.STRING(10), allowNull: false, defaultValue: '+8%'  },
  statesChange:   { type: DataTypes.STRING(10), allowNull: false, defaultValue: '+3'   },

  // Progress bars (0-100)
  webPct: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 72 },
  appPct: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 55 },
  crmPct: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 38 },

  // Monthly bar chart data (12 values, comma-separated)
  monthlyData: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: '30,50,38,70,55,85,62,90,72,95,80,100',
  },

  // Activity feed
  activityTitle: { type: DataTypes.STRING(120), allowNull: false, defaultValue: 'E-Commerce Platform launched' },
  activitySub:   { type: DataTypes.STRING(120), allowNull: false, defaultValue: 'Fashion Retail Co. · just now' },
}, {
  tableName: 'site_analytics',
  timestamps: true,
});

module.exports = SiteAnalytics;
