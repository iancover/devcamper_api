// Bootcamps REST Routers
  // this module handles routes for bootcamp requests
  // routers make code more efficient that way we can 
  // simply apply the request controller function
const express = require('express');

// Import Bootcamp Ctrlr & Courses Router
const { 
  getBootcamps, 
  getBootcamp, 
  createBootcamp, 
  updateBootcamp, 
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload
 } = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

const courseRouter = require('./courses');

// Router Setup
  // is like a 'mini-application' capable of performing middleware and routing functions
const router = express.Router();

// Protect/Authorize Routes Middleware
  // anywhere the user must be logged in, we pass this middleware
  // - user needs to be logged in to: upload photo, create, update & delete bootcamps
const { protect, authorize } = require('../middleware/auth');

// Re-route: Bootcamp Courses
  // - re-route from course router to get courses per bootcamp
router.use('/:bootcampId/courses', courseRouter);

// Route: Get Bootcamps in Radius
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