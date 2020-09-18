// USERS CTRLR

// Dependencies
// ----------------
  // 'ErrorResponse': utility to handle custom error msg
  // 'asyncHandler()': middleware to allow asynchronous functionality on ctrlrs
  // 'sendEmail()': utility to send and test sending email to reset pwd using nodemailer & mailtrap.io
  // 'User': the user model & schema
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// Controllers
// ----------------

// @desc    Get All Users
// @route   GET /api/v1/auth/users
// @access  Private/Admin 
// @details: admin only access to get all users data
  // 
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get Single User
// @route   GET /api/v1/auth/users/:id
// @access  Private/Admin 
// @details: admin only access to get user data
  // 
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create User
// @route   POST /api/v1/auth/users
// @access  Private/Admin 
// @details: admin only access to create a new user
  // 
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update User
// @route   PUT /api/v1/auth/users/:id
// @access  Private/Admin 
// @details: admin only access to update user info
  // 
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete User
// @route   DELETE /api/v1/auth/users/:id
// @access  Private/Admin 
// @details: admin only access to delete user
  // 
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: {}
  });
});