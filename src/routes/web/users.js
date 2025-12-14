const express = require('express');
const router = express.Router();
const userService = require('../../services/userService');
const { protect, requireAdmin } = require('../../middlewares/authMiddleware');
const {
  createUserValidator,
  updateUserValidator,
} = require('../../validators/userValidator');
const {
  handleFormValidationErrors,
} = require('../../middlewares/validationHandler');

// All user routes require admin
router.use(protect, requireAdmin);

// Users list with pagination and sorting
router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      order = 'DESC',
    } = req.query;

    const result = await userService.getAllUsers({
      page,
      limit,
      sortBy,
      order,
    });

    res.render('pages/users', {
      users: result.users,
      pagination: result.pagination,
      sortBy,
      order,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
});

// Create user page
router.get('/create', (req, res) => {
  res.render('pages/users-form', {
    user: req.user,
    error: null,
    errors: null,
  });
});

// Create user
router.post(
  '/',
  createUserValidator,
  handleFormValidationErrors('pages/users-form', async (req) => ({
    user: req.user,
  })),
  async (req, res, next) => {
    try {
      await userService.createUser(req.body);
      res.redirect('/users');
    } catch (error) {
      res.status(error.statusCode || 400).render('pages/users-form', {
        user: req.user,
        error: error.message,
        errors: null,
      });
    }
  }
);

// View user profile
router.get('/:id', async (req, res, next) => {
  try {
    const viewUser = await userService.getUserById(req.params.id);

    res.render('pages/users-profile', {
      viewUser,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
});

// Edit user page
router.get('/:id/edit', async (req, res, next) => {
  try {
    const editUser = await userService.getUserById(req.params.id);

    res.render('pages/users-form', {
      editUser,
      user: req.user,
      error: null,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
});

// Update user
router.put(
  '/:id',
  updateUserValidator,
  handleFormValidationErrors('pages/users-form', async (req) => {
    const editUser = await userService.getUserById(req.params.id);
    return {
      editUser: { ...editUser.toJSON(), ...req.body },
      user: req.user,
    };
  }),
  async (req, res, next) => {
    try {
      await userService.updateUser(req.params.id, req.body);
      res.redirect('/users');
    } catch (error) {
      const editUser = await userService.getUserById(req.params.id);
      res.status(error.statusCode || 400).render('pages/users-form', {
        editUser,
        user: req.user,
        error: error.message,
        errors: null,
      });
    }
  }
);

// Delete user
router.delete('/:id', async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user.id);
    res.redirect('/users');
  } catch (error) {
    if (error.statusCode === 403) {
      return res.redirect('/users?error=' + encodeURIComponent(error.message));
    }
    next(error);
  }
});

module.exports = router;
