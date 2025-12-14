const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { ROLES } = require('../constants/roles');
const {
  JWT_SECRET,
  REFRESH_SECRET,
  ACCESS_EXPIRES_IN,
  REFRESH_EXPIRES_IN,
} = require('../constants/jwt');

// Generate access token
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
};

// Login user
const login = async (username, password) => {
  const user = await User.findOne({ where: { username } });
  // Check if user exists
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;

    throw error;
  }

  // Check if user is admin
  if (user.role !== ROLES.ADMIN) {
    const error = new Error('Access denied. Admin only');
    error.statusCode = 403;

    throw error;
  }

  // Check if password is correct
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // Generate access and refresh tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return { accessToken, refreshToken };
};

// Refresh tokens
const refreshTokens = (refreshToken) => {
  // Verify refresh token
  const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

  // Generate new access and refresh tokens
  return {
    accessToken: generateAccessToken(decoded.id),
    refreshToken: generateRefreshToken(decoded.id),
  };
};

// Get user from token
const getUserFromToken = async (token) => {
  // Verify token
  const decoded = jwt.verify(token, JWT_SECRET);

  // Find user by id
  const user = await User.findByPk(decoded.id, {
    attributes: { exclude: ['password'] },
  });

  // Check if user exists
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 401;
    throw error;
  }

  return user;
};

module.exports = {
  login,
  refreshTokens,
  getUserFromToken,
};
