// Error Handler Middleware
  // this module handles the error responses 
  // using the 'errorResponse' constructor builds
  // specific response messages based on status code
const ErrorResponse = require('../utils/errorResponse');

// @desc Different ways to log db error messages based on types
  // - get the error and extract the content of 'message' field
  // - build error message with 'ErrorResponse' module passing message
  // - log entire error obj 'err' for developer to see
  // - Mongoose errors:
  //    Bad ObjectId - gets a 'CastError' error
  //    Duplicate Key - gets error code '11000'
  //    Validation Error - displays the name of error
  // - res.status(): if any of previous errors status code or 500
  //                 success = false, and send err msg or default 'Server Error'
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  console.log(err);

  // Mongoose: Bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose: Duplicate Key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose: Validation Error
  if(err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({ 
    success: false, 
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;