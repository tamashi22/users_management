const { body } = require('express-validator');
const { GENDERS } = require('../constants/genders');
const { ROLES } = require('../constants/roles');

const baseUserValidator = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),

  body('first_name').trim().notEmpty().withMessage('First name is required'),

  body('last_name').trim().notEmpty().withMessage('Last name is required'),

  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(Object.values(GENDERS))
    .withMessage('Invalid gender value'),

  body('birth_date')
    .notEmpty()
    .withMessage('Birth date is required')
    .isISO8601()
    .withMessage('Invalid date format'),

  body('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage('Invalid role value'),
];

const createUserValidator = [
  ...baseUserValidator,
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const updateUserValidator = [
  ...baseUserValidator,
  body('newPassword')
    .optional({ checkFalsy: true })
    .custom((value) => {
      // If value is provided and not empty, validate length
      if (value && value.trim().length > 0) {
        if (value.length < 6) {
          throw new Error('New password must be at least 6 characters');
        }
      }
      return true;
    }),
];

module.exports = {
  createUserValidator,
  updateUserValidator,
};
