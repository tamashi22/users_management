/**
 * Models index
 * Centralized export of all models
 */

const sequelize = require('../config/db');
const UserModel = require('./userModel');

// Here we can define relationships between models
// For example: User.hasMany(Post), Post.belongsTo(User)

const models = {
  User: UserModel,
  sequelize,
};
module.exports = models;

