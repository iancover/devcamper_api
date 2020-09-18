// Auth Router
const express = require('express');
const router = express.Router();

// Auth Controllers 
const { 
  register, 
  login, 
  getMe, 
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword
} = require('../controllers/auth');

// Auth Middleware
const { protect } = require('../middleware/auth');

// Routes
  // - 'post( reg-rte, reg-ctrl )': to register new user
  // - 'post( log-rte, log-ctrl )': to login existing user
  // - 'get( me-rte, private, me-ctrl ): to get current logged in user (private)
  // - 'put( upd-dtail-rte, private, upd-dtail-ctrl ): to update name/email (private)
  // - 'put( upd-pwd-rte, private, upd-pwd-ctrl ): to update pwd (private)
  // - 'post( forgot-pwd-rte, forgot-pwd-ctrl ): send email to reset pwd to login
  // - 'put( reset-pwd-rte, reset-pwd-ctrl ): update/reset pwd w/email link
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;