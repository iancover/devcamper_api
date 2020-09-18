// USERS ROUTERS

// App, Ctrls, Models
// --------------------------------
const express = require('express');
const { 
  getUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser
} = require('../controllers/users');
const User = require('../models/User');

// Router Setup
// ------------- 
const router = express.Router({ mergeParams: true });

// Middleware
// -------------
  // 'advancedResults': to sort and manage pagination, etc
  // 'protect': protects private routes access
  // 'authorize': grants role specific access
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);
router.use(authorize('admin'));

// Routes
// -----------

// @route: Get All Users & Create User
// @access Private Admin
  // logged in protected and authorized admin only access routes
  // - get all users
  // - create a user
router
  .route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser);

// @route: Get/Update/Delete User
// @access Private Admin
  // logged in protected and authorized admin only access routes
  // - get single user
  // - update user
  // - delete user
router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;