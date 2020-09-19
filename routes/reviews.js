// REVIEWS ROUTER
// ------------------

// Dependencies
const express = require('express');
const { 
  getReviews, 
  getReview,
  addReview
} = require('../controllers/reviews');
const Review = require('../models/Review');

// Router Setup
  // - must merge url params to pass bootcamp id from bootcamps router
  //   so controllers can get the courses of a bootcamp
const router = express.Router({ mergeParams: true });

// Middleware
  // - 'advancedResults()': sorts and limits docs for pagination, etc
  // - 'protect': limits access to logged in users only (create, update, delete)
  // - 'authorize': limits access to admin only
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Routes: 
//  Get All Reviews
//  Get Bootcamp Reviews
//  Add Review
// @details
  // - Router.route( endpoint ).http-method( middlware( model, { options }), ctrler ).http-method( )...
  // - 'advancedResults()': manages doc specific functions for sorting, pagination
  //                      its using 'Review' model for it, to link 'path' to bootcamp
  //                      and 'select(fieldstr fieldstr fieldstr)' which takes space separated str
  // - 'getReviews': controller
  // - 'post(protect, auth(user/admin), ctrl)': checks that user is logged in and that is a 'user' or
  //                        'admin', to prevent 'publisher' from writing their own reviews
router
  .route('/')
  .get(advancedResults(Review, {
    path: 'bootcamp',
    select: 'name description'
  }), getReviews)
  .post(protect, authorize('user', 'admin'), addReview);

// Routes: 
//  Get Single Review
// @details
  // fetches the review using the review's id
router
  .route('/:id')
  .get(getReview);
  
module.exports = router;