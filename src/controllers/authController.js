const authService = require('../services/authService');
const {
  ACCESS_COOKIE_MAX_AGE,
  REFRESH_COOKIE_MAX_AGE,
} = require('../constants/jwt');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

const login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // get tokens on login
    const { accessToken, refreshToken } = await authService.login(
      username,
      password
    );
    // set accessToken
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_COOKIE_MAX_AGE,
    });
    // set refreshToken
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_COOKIE_MAX_AGE,
    });

    res.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// logut and clear tokens from cookies
const logout = (req, res) => {
  res.cookie('accessToken', '', { ...cookieOptions, maxAge: 0 });
  res.cookie('refreshToken', '', { ...cookieOptions, maxAge: 0 });

  res.status(200).json({ message: 'Logout successful' });
};

const refresh = async (req, res, next) => {
  const { refreshToken: oldRefreshToken } = req.cookies;
  // check refresh token
  if (!oldRefreshToken) {
    const error = new Error('Refresh token required');
    error.statusCode = 401;
    return next(error);
  }
  // else refresh tockens and set to cookies
  try {
    const { accessToken, refreshToken } =
      authService.refreshTokens(oldRefreshToken);

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_COOKIE_MAX_AGE,
    });
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_COOKIE_MAX_AGE,
    });

    res.status(200).json({ accessToken, refreshToken });
  } catch {
    res.cookie('accessToken', '', { ...cookieOptions, maxAge: 0 });
    res.cookie('refreshToken', '', { ...cookieOptions, maxAge: 0 });

    const error = new Error('Invalid refresh token');
    error.statusCode = 401;
    next(error);
  }
};

module.exports = { login, logout, refresh };
