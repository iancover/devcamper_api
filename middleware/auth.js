// AUTH & ROLE ACCESS MIDDLEWARE

// Dependencies
// ---------------
  // 'jsonwebtoken': creates token for session access and not have to grant access on each request
  // 'asyncHandler()': middlware to handle asynchronous functionality
  // 'ErrorResponse()': utility function to create custom error response messages
  // 'User()': model to access db with mongoose 
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Middleware
// --------------

// @desc: Protect Private Route Access
// @details: checks if user logged in using token info on header with 'jwt'
  // using 'jwt' secret token info on request authorization header, extracts/decodes/verifies user id
  // - 'req.headers.authorization': we can access the req headers, in this case the 'authorization' which
  //    contains 'Bearer...' and the token, so we extract the token w/split()[1]
  // - 'req.cookies.token': but if we use cookies, on 'login' a cookie gets sent in place of the token
  //                       and now on protected routes with that authorization like 'get logged in user'
  //                       it is still gonna work even if you take off the 'Authorization: Bearer token' info
  // - '!token': if no token send error
  // - 'try/catch': verify and decode, or send error msg
  //    'User.findById(decoded.id)': verify/decode w/secret token info to see if user logged in
exports.protect = asyncHandler(async function(req, res, next) {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];

  } 
    // else if (req.cookies.token) {
    //   token = req.cookies.token;
    // }
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

// @desc: Grant Role Specific Access
// @details: if user's role doesn't have acces returns error
  // gets the user role and if its not an authorized role generates an error
  // - must return synchronous function so we can pass roles on that step with 'next()' since its midware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403));
    }
    next();
  };
};