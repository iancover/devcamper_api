
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
    // - 'token': create jwt token on the user calling middleware using user's id '_id'
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role
  });

  const token = user.getSignedJwtToken();
  res.status(200).json({ success: true, token });
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
    // - Create token for session
    //  'token': create a token to use credentials for this session, each login creates new session token
  
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

  const token = user.getSignedJwtToken();

  res.status(200).json({ success: true, token });
});