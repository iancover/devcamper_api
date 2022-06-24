// Middleware
const asyncHandler = require('../middleware/async');
// Models
const User = require('../models/User');
// Utilities
const ErrorResponse = require('../utils/errorResponse');

// @desc      GET  All users
// @access    Private/Admin
// @route     /api/v1/auth/users
// @details   admin only access to get all users data
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      GET  User by Id
// @access    Private/Admin
// @route     /api/v1/auth/users/:id
// @details   admin only access to get user data
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      POST  Create User
// @access    Private/Admin
// @route     /api/v1/auth/users
// @details   admin only access to create a new user
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({
    success: true,
    data: user,
  });
});

// @desc      PUT  Update user
// @route     /api/v1/auth/users/:id
// @access    Private/Admin
// @details   admin only access to update user info
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      DELETE  User by Id
// @route     /api/v1/auth/users/:id
// @access    Private/Admin
// @details   admin only access to delete user
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: {},
  });
});
