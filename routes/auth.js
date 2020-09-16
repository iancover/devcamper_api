// Auth Router
const express = require('express');
const router = express.Router();

// Auth Controllers 
const { 
  register, 
  login, 
  getMe, 
  forgotPassword 
} = require('../controllers/auth');

// Auth Middleware
const { protect } = require('../middleware/auth');

// Routes
  // - to register new user 
  // - to login existing user 
  // - user access when logged in, private so needs 'protect' midware
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);

module.exports = router;