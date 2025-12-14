const { validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

// Handle form validation errors
const handleFormValidationErrors =
  (view, getAdditionalData) => async (req, res, next) => {
    const result = validationResult(req);

    // Check if there are validation errors
    if (!result.isEmpty()) {
      // Create errors object
      const errors = {};
      // Add errors to object
      result.array().forEach((err) => {
        // Check if error path is not already in object
        if (!errors[err.path]) {
          // Add error to object
          errors[err.path] = err.msg;
        }
      });

      // Get additional data
      let additionalData = {};
      // Check if getAdditionalData is a function
      if (typeof getAdditionalData === 'function') {
        additionalData = await getAdditionalData(req);
      }

      return res.status(400).render(view, {
        error: null,
        errors,
        ...req.body,
        ...additionalData,
      });
    }

    next();
  };

module.exports = { handleValidationErrors, handleFormValidationErrors };
