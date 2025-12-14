const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const {
  createUserValidator,
  updateUserValidator,
} = require('../../validators/userValidator');
const {
  handleValidationErrors,
} = require('../../middlewares/validationHandler');
const { protect, requireAdmin } = require('../../middlewares/authMiddleware');

// Current user
router.get('/me', protect, userController.getMe);

// Admin only
router.use(protect, requireAdmin);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post(
  '/',
  createUserValidator,
  handleValidationErrors,
  userController.createUser
);
router.put(
  '/:id',
  updateUserValidator,
  handleValidationErrors,
  userController.updateUser
);
router.delete('/:id', userController.deleteUser);

module.exports = router;
