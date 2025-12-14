const userService = require('../services/userService');

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, sortBy, order } = req.query;
    const result = await userService.getAllUsers({
      page,
      limit,
      sortBy,
      order,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Get user by id
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
      data: user,
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        message: error.message,
      });
    }
    next(error);
  }
};

// Create user
const createUser = async (req, res, next) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json({
      message: 'User created successfully',
      data: newUser,
    });
  } catch (error) {
    if (error.message === 'Username already exists') {
      return res.status(409).json({
        message: error.message,
      });
    }
    next(error);
  }
};

// Get me
const getMe = (req, res) => {
  res.status(200).json(req.user);
};

const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Username already exists') {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
};

// Delete user
const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'You cannot delete yourself') {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getMe,
};
