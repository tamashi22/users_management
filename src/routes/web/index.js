const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const usersRoutes = require('./users');
const userService = require('../../services/userService');
const { protect } = require('../../middlewares/authMiddleware');

// Home redirect
router.get('/', (req, res) => res.redirect('/users'));

// My Profile (current user)
router.get('/profile', protect, async (req, res, next) => {
  try {
    const viewUser = await userService.getUserById(req.user.id);

    res.render('pages/users-profile', {
      viewUser,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
});

// Routes
router.use('/', authRoutes);
router.use('/users', usersRoutes);

module.exports = router;
