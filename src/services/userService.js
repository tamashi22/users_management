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

const getAllUsers = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'created_at',
    order = 'DESC',
  } = options;

  const sortField = ALLOWED_SORT_FIELDS.includes(sortBy)
    ? sortBy
    : 'created_at';
  const sortOrder = ALLOWED_ORDER.includes(order.toUpperCase())
    ? order.toUpperCase()
    : 'DESC';

  const offset = (page - 1) * limit;

  const { count, rows } = await User.findAndCountAll({
    attributes: { exclude: ['password'] },
    order: [[sortField, sortOrder]],
    limit: Number(limit),
    offset,
  });

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
  const existingUser = await User.findOne({
    where: { username: userData.username },
  });

  if (existingUser) {
    throw new Error('Username already exists');
  }

  const hashedPassword = await hashPassword(userData.password);

  const user = await User.create({
    ...userData,
    password: hashedPassword,
    role: userData.role || ROLES.USER,
  });

  const userResponse = user.toJSON();
  delete userResponse.password;

  return userResponse;
};

const updateUser = async (id, userData) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error('User not found');
  }

  // Check if username is taken by another user
  if (userData.username && userData.username !== user.username) {
    const existingUser = await User.findOne({
      where: { username: userData.username },
    });

    if (existingUser) {
      throw new Error('Username already exists');
    }
  }

  // Handle password update if newPassword is provided
  const updateData = { ...userData };
  if (updateData.newPassword) {
    updateData.password = await hashPassword(updateData.newPassword);
    delete updateData.newPassword;
  }

  await user.update(updateData);

  const userResponse = user.toJSON();
  delete userResponse.password;

  return userResponse;
};

const deleteUser = async (id, currentUserId) => {
  if (Number(id) === Number(currentUserId)) {
    const error = new Error('You cannot delete yourself');
    error.statusCode = 403;
    throw error;
  }

  const user = await User.findByPk(id);

  if (!user) {
    throw new Error('User not found');
  }

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
