const crypto = require('crypto'); // Node built-in

// Middleware
const asyncHandler = require('../middleware/async');
// Models
const User = require('../models/User');
// Utils
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

// @desc      POST  Create user
// @access    Public
// @route     /api/v1/auth/register
// @details   registers new user with: name, email, pwd & role
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role });
  sendTokenResponse(user, 200, res);
});

// @desc      POST  Auth user
// @access    Public
// @route     /api/v1/auth/login
// @details   login user with email & pwd
exports.login = asyncHandler(async (req, res, next) => {
  // validate input
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }
  // verify user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }
  sendTokenResponse(user, 200, res);
});

// @desc      GET  Logout user & clear cookie
// @access    Private
// @route     /api/v1/auth/logout
// @details   log user out and clear auth session cookie
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      GET  Current auth user
// @access    Private
// @route     /api/v1/auth/me
// @details   gets current logged in user info
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      PUT  Update user details
// @access    Private
// @route     /api/v1/auth/updatedetails
// @details   updates the user's name & email
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      PUT  Update pwd
// @access    Private
// @route     /api/v1/auth/updatepassword
// @details   validates pwd using bcrypt and updates
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  const matched = await user.matchPassword(req.body.currentPassword);

  if (!matched) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }
  user.password = req.body.newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

// @desc      POST   Forgot pwd
// @access    Public
// @route     /api/v1/auth/forgotpassword
// @details   handles sending user reset pwd email
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // verify user
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;
  const message =
    `Email sent because you or someone else requested to reset a password, ` +
    `send request to URL: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });
    // @todo fix err from headers sent twice
    // error: [ERR_HTTP_HEADERS_SENT]
    res.status(200).json({
      success: true,
      data: 'Email sent',
    });
  } catch (err) {
    console.log(`forgotPassword() try/catch triggered: ${err}`);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Email could not be sent', 500));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      PUT  Reset pwd
// @access    Public
// @route     /api/v1/auth/resetpassword/:resettoken
// @details   resets the pwd & session token by matching encrypted data
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Generate session cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  // verify env
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};
