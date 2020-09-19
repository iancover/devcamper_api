// BOOTCAMPS REST ROUTERS
  // this module handles routes for bootcamp requests
  // routers make code more efficient that way we can 
  // simply apply the request controller function
const express = require('express');

// Bootcamp Controllers
const { 
  getBootcamps, 
  getBootcamp, 
  createBootcamp, 
  updateBootcamp, 
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload
 } = require('../controllers/bootcamps');

// Bootcamp Model
const Bootcamp = require('../models/Bootcamp');

// Middleware
  // 'advancedResults': handles the select, limits, etc. for pagination
const advancedResults = require('../middleware/advancedResults');

// Courses Router
  // we need this router since we need to be able to get the courses for the bootcamp
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

// Bootcamps Router Setup
  // is like a 'mini-application' capable of performing middleware and routing functions
const router = express.Router();

// Protect/Authorize Routes Middleware
  // anywhere the user must be logged in, we pass this middleware
  // - user needs to be logged in to: upload photo, create, update & delete bootcamps
const { protect, authorize } = require('../middleware/auth');

// Re-route: Bootcamp Courses & Reviews
  // - re-route from course router to get courses per bootcamp
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

// Route: Get Bootcamps in Radius
  // this route's reques uses 'geocoder', we dont need module here though
router
  .route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius);

// Route: Update Bootcamp Photo
  // - 'protect' because must be existing user and logged in to update photo
router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

// Route: Get Bootcamps/Add New Bootcamp
  // - 'protect' because user must be logged in to add bootcamp
router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

// Route: Get/Update/Delete Bootcamp
  // - 'protect' because user must be logged in to update/delete
router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;