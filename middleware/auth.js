const jwt = require('jsonwebtoken');

// Middleware
const asyncHandler = require('./async');
// Models
const User = require('../models/User');
// Utils
const ErrorResponse = require('../utils/errorResponse');

// Protect private routes
exports.protect = asyncHandler(async function (req, res, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await User.findById(decoded.id); // currently logged in user
    next();
  } catch (error) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant role specific access
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`${req.user.role} role unauthorized access`, 403)
      );
    }
    next();
  };
};
