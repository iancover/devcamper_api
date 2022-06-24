const express = require('express');
const router = express.Router();

// Controllers
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps');
// Models
const Bootcamp = require('../models/Bootcamp');
// Routes
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');
// Middleware
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Re-routes
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

// Routes
// ----------

// Bootcamps by radius
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

// Update photo by bootcamp Id
router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

// Get bootcamps or create bootcamp
router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

// Get, update or delete bootcamp
router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;
