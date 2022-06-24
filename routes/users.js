const express = require('express');
const router = express.Router({ mergeParams: true });

// Controllers
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/users');
const User = require('../models/User');

// Middleware
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Apply to all
router.use(protect);
router.use(authorize('admin'));

// Routes
// -----------

// Get users & create user
router.route('/').get(advancedResults(User), getUsers).post(createUser);

// Get, update, delete user by Id
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
