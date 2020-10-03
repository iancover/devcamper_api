// Async Handler Module
  // helps handle promises and catch errors on controllers
  // - takes the function passed 'fn'
  // - returns a 'function(req, res, next)', that handles the Promise
  //   using the req and the res from function passed
  // - Promises are objects so must be returned
  //   'return Promise.resolve().catch()' - will resolve, or catch error
  //                                        and let next process run without interrupting flow
  // - 'module.exports': exports the function 'asyncHandler()' as the module itself
const asyncHandler = fn => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;

// ES5 version
  // const asyncHandler2 = function(fn) { 
  //   return function(req, res, next) {
  //     return Promise.resolve(fn(req, res, next)).catch(next);
  //   };
  // };