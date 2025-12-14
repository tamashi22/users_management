const Tokens = require('csrf');

const tokens = new Tokens();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

/**
 * Generate CSRF token and store secret in cookie
 */
const generateToken = (req, res, next) => {
  // Get or create secret from cookie
  let secret = req.cookies['_csrf'];

  if (!secret) {
    secret = tokens.secretSync();
    res.cookie('_csrf', secret, { ...cookieOptions, maxAge: 86400000 }); // 24 hours
  }

  // Generate token from secret
  const token = tokens.create(secret);

  // Make token available in templates
  res.locals.csrfToken = token;
  req.csrfToken = token;

  next();
};

/**
 * Verify CSRF token
 */
const verifyToken = (req, res, next) => {
  // Skip CSRF verification for API routes
  if (req.path.startsWith('/api')) {
    return next();
  }

  // Skip GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const secret = req.cookies['_csrf'];
  const token = req.body._csrf || req.query._csrf;

  if (!secret || !token) {
    const error = new Error('CSRF token missing');
    error.statusCode = 403;
    return next(error);
  }

  if (!tokens.verify(secret, token)) {
    const error = new Error('Invalid CSRF token');
    error.statusCode = 403;
    return next(error);
  }

  next();
};

module.exports = {
  generateToken,
  verifyToken,
};
