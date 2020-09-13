
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Register user
  // @route   GET /api/v1/auth/register
  // @access  Public 
  // @details: 
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create User
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  // Create Token
    // - calls token middleware on user w/id
  const token = user.getSignedJwtToken();

  res.status(200).json({ success: true, token });
});