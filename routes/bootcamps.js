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

// Protect Routes Middleware
  // anywhere the user must be logged in, we pass this middleware
  // - user needs to be logged in to upload photo, create & update bootcamp
const { protect } = require('../middleware/auth');

// Routes
  // - re-route from course router to get courses per bootcamp
  // - route per radius, zipcode and distance
  // - route root to get all bootcamps or create one
  // - route to get, update or delete single bootcamp
router.use('/:bootcampId/courses', courseRouter);

router
  .route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius);

router
  .route('/:id/photo')
  .put(protect, bootcampPhotoUpload);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;