const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const { loginValidator } = require('../../validators/loginValidator');
const {
  handleValidationErrors,
} = require('../../middlewares/validationHandler');
const { protect } = require('../../middlewares/authMiddleware');

router.post(
  '/login',
  loginValidator,
  handleValidationErrors,
  authController.login
);
router.get('/refresh', authController.refresh);
router.get('/logout', protect, authController.logout);

module.exports = router;
