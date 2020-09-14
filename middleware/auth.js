
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');


// Protect Routes
  // - 'req.headers.authorization': we can access the req headers, in this case the 'authorization' which
  //    contains 'Bearer...' and the token, so we extract the token w/split()[1]
exports.protect = asyncHandler(async function(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  if (!token) {
    return next(new ErrorResponse('Not authorize to access this route', 401));
  }

  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await User.findById(decoded.id); // currently logged in user
    next();
  } catch (error) {
    return next(new ErrorResponse('Not authorize to access this route', 401));
  }
});