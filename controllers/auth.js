// AUTH CONTROLLERS

// Dependencies
// ---------------
  // 'crypto': node built-in module that allows working with cryptographic functionality
  //          https://nodejs.org/dist/latest-v11.x/docs/api/crypto.html
  // 'ErrorResponse': utility to handle custom error msg
  // 'asyncHandler()': middleware to allow asynchronous functionality on ctrlrs
  // 'sendEmail()': utility to send and test sending email to reset pwd using nodemailer & mailtrap.io
  // 'User': the user model & schema
const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// Controllers
// --------------

// @desc    Register User
// @route   POST /api/v1/auth/register
// @access  Public 
// @details: registers new user with: name, email, pwd & role
    // - extract 'name, email, pwd, role' from body
    // - 'user': create a user with data
    // - Create cookie with session token
    //  'sendTokenResponse()'
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role });
  sendTokenResponse(user, 200, res);
});

// @desc    Login User
// @route   POST /api/v1/auth/login
// @access  Public 
// @details: login user with email & pwd
    // - Extract/Verify login credentials from body
    //    { email, pwd }: extract from request body
    //    'if(email || pwd)': validate email and pwd make sure they exist, and error msg
    // - Check if existing user
    //    'user = await User.findOne().select(+pwd)': check if user w/pwd exists in db, or create error msg
    // - Compare pwd entered and hashed in db
    //    'user.matchPassword()': pass pwd to method to verify if pwd entered and hashed match, or create error msg
    // - Create cookie with session token
    //    'sendTokenResponse()'
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  } 
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

// @desc    Logout User / Clear Cookie
// @route   GET /api/v1/auth/logout
// @access  Private
// @details: log user out and clear the session cookie
  // - 'res.cookie()': using Express response method '.cookie( name, value, opts )'
  //                  we clear the token with 'token', 'none' and set the cookie
  //                   to expire in 10 seconds
  // - options:
  //   'expires': when you want cookie session to expire
  //   'httpOnly': flags the cookie to be accessible only by the web server
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Current Logged User
// @route   POST /api/v1/auth/me
// @access  Private
// @details: gets current logged in user info
    // to be able to get user access data, ex clicking on 'profile' page,
    // must be existing user and logged in
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update User Details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
// @details: updates the user's name & email
    // - 'fieldsToUpdate': data to send w/new fields
    // - 'User.findByIdAndUpdate(id, data, options{new, validate})': send data and validate fields
    // - send status and user data
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update Password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
// @details: updates the user's pwd comparing encrypted data w/bcrypt
    // - get current user's pwd field and update passing '+password' to '.select()'  
    //   remember the select field is: User.password.select = 'false'
    // - check if current pwd matches, using middlware 'UserSchema.methods.matchPassword()'
    //   returns promise so use parenthesis to negate the result '!( match pwd result )'
    //    UserSchema.methods.matchPassword = async (enteredPassword) => await bcrypt.compare(enteredPassword, this.password) 
    // - 'user.password = req.body.newPassword': if matches assign new pwd
    // - save user & send token response
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }
  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
// @details: handles sending email to user to reset pwd
    // so if user forgets pwd, we dont want to reset token every attempt, we send email to reset
    // - find the user with that email, if not error response
    // - get un-hashed reset pwd token
    // - save user without validating fields before save, since fields will be updated 
    //   (make sure pre(save) hook fn has if 'this.isModified(pwd)' logic 'next()')
    // - 'resetUrl': create a reset url with proper protocol 'http/https', 'host' & 'reset token'
    //               so user can just click on it and get redirected
    // - 'message': and the message on the email
    // 
    // - try/catch: try sending the email, remember options are passed 'sendEmail(options)'
    //              'email: user.email, subject: str, message' (message: message) and response
    //              catch error, log it and clear the 'getResetPasswordToken/Expire' fields
    //              and don't validate fields before saving because they will be updated
    // - send response status back with user data
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) have requested the reset of a password, please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

    // getting error: [ERR_HTTP_HEADERS_SENT], from headers being sent twice, need fix
    res.status(200).json({
      success: true,
      data: 'Email sent'
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
    data: user
  });
});

// @desc    Reset Password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
// @details: resets the password & token by matching encrypted data
    // - get hashed token
    // - find user by hashed reset token and set pwd expire greater than now
    // - check if user exists, if not 'Invalid token' error
    // - if it does exist, set new pwd and reset Token/Expire = undefined, and save user
    // - send token response
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
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


// Handlers
// -------------------

// @desc  Create Cookie from Token
// @details: creates session token to and stores in browser cookies
  // so not to have to request token everytime, tokens are unique for that session so user can have private access
  // until session expires or cookies
  // - need to set same 30 days expiration in cookie as well, so we pass options
  //   in options create new Date() object making expire date 30 days from today
  //   'expires' field needs to be in milliseconds
  //   JWT_COOKIE_EXPIRE = days
  //   JWT_COOKIE_EXPIRE * 24(hrs) * 60(mins) * 60(secs) * 1000(millisecs)
  // - set 'secure' flag only when in 'production' not development
  // - send response with 'statusCode', tokenized cookie w/options
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ 
      success: true,
      token
    });
};