const express = require('express');
const router = express.Router({ mergeParams: true }); // ref bootcamps

// Controllers
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews');
// Models
const Review = require('../models/Review');
// Middleware
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Routes
// ---------

// Get reviews & add review
router
  .route('/')
  .get(
    advancedResults(Review, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getReviews
  )
  .post(protect, authorize('user', 'admin'), addReview);

// Get, update, delete review by Id
router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;
