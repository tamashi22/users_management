require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const { errorHandler } = require('./middlewares/errorHandler');
const { generateToken, verifyToken } = require('./middlewares/csrfMiddleware');
const webRoutes = require('./routes/web');
const apiRoutes = require('./routes/api');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

// CSRF protection - generate token for all requests
app.use(generateToken);
// CSRF protection - verify token for state-changing requests
app.use(verifyToken);

// Routes
app.use('/', webRoutes);
app.use('/api', apiRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;
