/**
 * Initialize database connection and sync models
 * This function should be called once at server startup
 */

const sequelize = require('../config/db');
const { User } = require('../models');
const { Sequelize } = require('sequelize');
const demoUsersSeeder = require('../seeders/20251214222400-demo-users');

/**
 * Synchronize models with database
 */
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✓ Database synchronized successfully.');

    return true;
  } catch (error) {
    console.error('✗ Error synchronizing database:', error.message);
    return false;
  }
};

/**
 * Seed database with demo users if it's empty
 */
const seedDatabase = async () => {
  try {
    const userCount = await User.count();

    if (userCount === 0) {
      console.log('Database is empty. Seeding demo users...');

      // Use the seeder function
      const queryInterface = sequelize.getQueryInterface();
      await demoUsersSeeder.up(queryInterface, Sequelize);

      console.log('Successfully seeded demo users.');
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

/**
 * Initialize database connection and sync models
 */
const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    await sequelize.authenticate();
    console.log('Database initialized successfully');

    // Sync models
    // { alter: true } - updates tables without deleting data
    // { force: true } - recreates tables (deletes data)
    await syncDatabase({ alter: process.env.NODE_ENV !== 'production' });

    // Seed database if empty
    await seedDatabase();

    return true;
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    return false;
  }
};

module.exports = {
  syncDatabase,
  initializeDatabase,
  seedDatabase,
};
