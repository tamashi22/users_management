const authService = require('../services/authService');
const { ROLES } = require('../constants/roles');
const {
  ACCESS_COOKIE_MAX_AGE,
  REFRESH_COOKIE_MAX_AGE,
} = require('../constants/jwt');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

// Clear tokens
const clearTokens = (res) => {
  res.cookie('accessToken', '', { ...cookieOptions, maxAge: 0 });
  res.cookie('refreshToken', '', { ...cookieOptions, maxAge: 0 });
};

// Create unauthorized error
const createUnauthorizedError = () => {
  const error = new Error('Unauthorized');
  error.statusCode = 401;
  return error;
};

// Set token cookies
const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
};

// Protect route
const protect = async (req, res, next) => {
  try {
    let { accessToken } = req.cookies;
    const { refreshToken } = req.cookies;

    // Check if it's an API request (use originalUrl which includes the full path)
    const isApiRequest = req.originalUrl.startsWith('/api');

    // Check if access token or refresh token is present
    if (!accessToken && !refreshToken) {
      // For web requests, redirect to login
      if (!isApiRequest) {
        return res.redirect('/login');
      }
      // For API requests, return error
      return next(createUnauthorizedError());
    }

    // Check if access token is not present but refresh token is present
    if (!accessToken && refreshToken) {
      const tokens = authService.refreshTokens(refreshToken);
      accessToken = tokens.accessToken;
      setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
    }

    // Get user from token
    req.user = await authService.getUserFromToken(accessToken);
    next();
  } catch (error) {
    // Check if token is expired and refresh token is present
    if (error.name === 'TokenExpiredError' && req.cookies.refreshToken) {
      try {
        // Refresh tokens
        const tokens = authService.refreshTokens(req.cookies.refreshToken);
        // Set token cookies
        setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
        req.user = await authService.getUserFromToken(tokens.accessToken);

        return next();
      } catch {
        // Clear tokens
        clearTokens(res);
        // For web requests, redirect to login
        if (!req.originalUrl.startsWith('/api')) {
          return res.redirect('/login');
        }
        // For API requests, return error
        return next(createUnauthorizedError());
      }
    }

    // Clear tokens
    clearTokens(res);
    // For web requests, redirect to login
    if (!req.originalUrl.startsWith('/api')) {
      return res.redirect('/login');
    }
    // For API requests, return error
    return next(createUnauthorizedError());
  }
};

// Require admin
const requireAdmin = (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== ROLES.ADMIN) {
    // Create admin access required error
    const error = new Error('Admin access required');
    error.statusCode = 403;

    return next(error);
  }
  // Next middleware
  next();
};

module.exports = { protect, requireAdmin };
