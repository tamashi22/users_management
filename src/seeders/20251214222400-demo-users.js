const { hashPassword } = require('../utils/hashPassword');
const demoUsers = require('../constants/demoUsers');

module.exports = {
  /**
   * Seed demo users with hashed passwords
   */
  async up(queryInterface, Sequelize) {
    // Password for all users: "password123"
    const hashedPassword = await hashPassword('password123');

    await queryInterface.bulkInsert(
      'users',
      demoUsers.map((user) => ({
        ...user,
        password: hashedPassword,
      })),
      {}
    );
  },

  /**
   * Remove seeded users
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'users',
      {
        username: {
          [Sequelize.Op.in]: [...demoUsers.map((user) => user.username)],
        },
      },
      {}
    );
  },
};
