const { User } = require('../models');
const { hashPassword } = require('../utils/hashPassword');
const { ROLES } = require('../constants/roles');

const ALLOWED_SORT_FIELDS = [
  'username',
  'first_name',
  'last_name',
  'birth_date',
  'created_at',
];
const ALLOWED_ORDER = ['ASC', 'DESC'];

// Get all users
const getAllUsers = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'created_at',
    order = 'DESC',
  } = options;

  // Validate sort field
  const sortField = ALLOWED_SORT_FIELDS.includes(sortBy)
    ? sortBy
    : 'created_at';
  const sortOrder = ALLOWED_ORDER.includes(order.toUpperCase())
    ? order.toUpperCase()
    : 'DESC';

  // Calculate offset
  const offset = (page - 1) * limit;

  // Find all users
  const { count, rows } = await User.findAndCountAll({
    attributes: { exclude: ['password'] },
    order: [[sortField, sortOrder]],
    limit: Number(limit),
    offset,
  });

  // Return users and pagination
  return {
    users: rows,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

// Get user by id
const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

const createUser = async (userData) => {
  // Check if username is already taken
  const existingUser = await User.findOne({
    where: { username: userData.username },
  });

  if (existingUser) {
    throw new Error('Username already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Create user
  const user = await User.create({
    ...userData,
    password: hashedPassword,
    role: userData.role || ROLES.USER,
  });

  // Return user response
  const userResponse = user.toJSON();
  delete userResponse.password;

  return userResponse;
};

// Update user
const updateUser = async (id, userData) => {
  // Check if user exists
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error('User not found');
  }

  // Check if username is already taken
  if (userData.username && userData.username !== user.username) {
    const existingUser = await User.findOne({
      where: { username: userData.username },
    });

    if (existingUser) {
      throw new Error('Username already exists');
    }
  }

  // Hash password if newPassword is provided
  const updateData = { ...userData };
  if (updateData.newPassword) {
    updateData.password = await hashPassword(updateData.newPassword);
    delete updateData.newPassword;
  }

  await user.update(updateData);

  // Return user response
  const userResponse = user.toJSON();
  delete userResponse.password;

  return userResponse;
};

const deleteUser = async (id, currentUserId) => {
  // Check if user is trying to delete themselves
  if (Number(id) === Number(currentUserId)) {
    const error = new Error('You cannot delete yourself');
    error.statusCode = 403;
    throw error;
  }

  // Check if user exists
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error('User not found');
  }

  // Delete user
  await user.destroy();

  return { message: 'User deleted successfully' };
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
