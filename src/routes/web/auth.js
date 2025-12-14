const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const { loginValidator } = require('../../validators/loginValidator');
const {
  handleFormValidationErrors,
} = require('../../middlewares/validationHandler');
const { protect } = require('../../middlewares/authMiddleware');
const { webHandler } = require('../../utils/webHandler');

// Login page
router.get('/login', (req, res) => {
  res.render('pages/auth', { error: null, errors: null, username: '' });
});

// Login form submit
router.post(
  '/login',
  loginValidator,
  handleFormValidationErrors('pages/auth'),
  webHandler(authController.login, '/users', 'pages/auth')
);

// Logout
router.get(
  '/logout',
  protect,
  webHandler(authController.logout, '/login', 'pages/auth')
);

module.exports = router;
