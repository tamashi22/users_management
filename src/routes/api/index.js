const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const usersRoutes = require('./users');

// API routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);

module.exports = router;
