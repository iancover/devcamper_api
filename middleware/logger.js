// @desc   Logs requests to console (instead of Morgan)
  // - created this middleware to show custom middleware
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  next();
};

module.exports = logger;