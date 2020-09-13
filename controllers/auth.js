
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Register user
  // @route   POST /api/v1/auth/register
  // @access  Public 
  // @details: 
    // called when registering a new user
    // - extract 'name, email, pwd, role' from body
    // - 'user': create a user with data
    // - Create cookie with session token
    //  'sendTokenResponse()'
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role
  });

  sendTokenResponse(user, 200, res);
});


// @desc    Login user
  // @route   POST /api/v1/auth/login
  // @access  Public 
  // @details: 
    // called when existing user logging in, so only need email and pwd from body
    // - Extract/Verify login credentials from body
    //  { email, pwd }: extract from request body
    //  'if(email || pwd)': validate email and pwd make sure they exist, and error msg
    // - Check if existing user
    //  'user = await User.findOne().select(+pwd)': check if user w/pwd exists in db, or create error msg
    // - Compare pwd entered and hashed in db
    //  'user.matchPassword()': pass pwd to method to verify if pwd entered and hashed match, or create error msg
    // - Create cookie with session token
    //  'sendTokenResponse()'
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


// Create Cookie from Token
  // creates a session token to get access with credentials 'signed in status' and stores in cookies to save to browser
  // so not to have to request token everytime, tokens are unique for that session so user can have private access
  // until session expires or cookies
  // - need to set same 30 days expiration in cookie as well, so we pass options
  //   in options create new Date() object making expire date 30 days from today
  // - set 'secure' flag only when in 'production' not development
  // - send response with 'statusCode', tokenized cookie w/options
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
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