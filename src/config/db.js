const { Sequelize } = require('sequelize');

/**
 * PostgreSQL Database Configuration
 * Sequelize ORM setup with connection pooling and environment-specific settings
 */

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    models: [__dirname + '/../models'],

    // Connection pool settings
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },

    // Logging SQL requests (disabled in production)
    logging: process.env.NODE_ENV === 'production' ? false : console.log,

    // Additional settings
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: false,
    },
  }
);

module.exports = sequelize;
