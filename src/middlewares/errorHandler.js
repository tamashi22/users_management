const { ValidationError } = require('sequelize');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Check if it's an API request
  const isApiRequest = req.path.startsWith('/api');

  // Check if error is a validation error
  if (err instanceof ValidationError) {
    if (isApiRequest) {
      // Return validation error for API
      return res.status(422).json({
        message: err.message,
        errors: err.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }
    // For web requests, redirect with error
    return res.redirect(
      req.get('Referer') || '/users?error=' + encodeURIComponent(err.message)
    );
  }

  // Get status code
  const statusCode = err.statusCode || 500;

  // Handle CSRF errors for web requests
  if (
    (statusCode === 403 && err.message.includes('CSRF')) ||
    err.message === 'CSRF token missing' ||
    err.message === 'Invalid CSRF token'
  ) {
    if (!isApiRequest) {
      return res.redirect(
        req.get('Referer') ||
          '/users?error=' +
            encodeURIComponent(
              'CSRF token validation failed. Please try again.'
            )
      );
    }
  }

  // Handle unauthorized errors for web requests
  if (statusCode === 401 && !isApiRequest) {
    return res.redirect('/login');
  }

  // For API requests, return JSON
  if (isApiRequest) {
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }

  // For web requests, redirect with error message
  return res.redirect(
    req.get('Referer') ||
      '/users?error=' +
        encodeURIComponent(err.message || 'Internal server error')
  );
};

module.exports = { errorHandler };
