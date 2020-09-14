// Auth Router
const express = require('express');
const router = express.Router();

// Modules/Middleware
const { register, login, getMe } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

// Routes
  // - to register new user 
  // - to login existing user 
  // - user access when logged in, private so needs 'protect' midware
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;