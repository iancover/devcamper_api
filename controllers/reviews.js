// REVIEWS CONTROLLERS
// -----------------------

// Dependencies
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

// Controllers
// -----------------------
// @desc    Get Reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public 
// @details: get reviews for bootcamp if id present, otherwise all reviews
  // - 'Review.find()': gets all the reviews for a bootcamp if there is a bootcampId in params
  // - else all reviews using 'advancedResults' middleware
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });

  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get Single Review
// @route   GET /api/v1/reviews/:id
// @access  Public 
// @details: get the review and the bootcamp's info
  // - 'Review.findById().populate({ path, select })': get the review getting also bootcamps name and desc
  // - handle 404 error and send
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });
  if (!review) {
    return next(new ErrorResponse(`No review found with the id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Add  Review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Private 
// @details: with correct bootcamp and user id, get bootcamp and create review
  // - 'req.body.bootcamp': make sure its for the correct bootcamp with id
  // - 'req.body.user': and also the correct user
  // - 'Bootcamp.findById()': get the bootcamp we are adding review to or handle 404: File Not Found
  // - 'Review.create(req.body)': create and save the review
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404));
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Update  Review
// @route   PUT /api/v1/reviews/:id
// @access  Private 
// @details: get the review, check auth credentials and update
  // - 'review': get the review by id if not found, error 404: Page/File Not Found
  // - 'review.user.toString()': need to parse 'review.user' as a String to compare
  //                             to 'req.user.id' and 'req.user.role' to 'admin'
  //                            if not error 401: Unauthorized Client, lacks proper credentials
  // - 'review': findByIdAndUpdate(id, body, opts) save updated review and send as data
  //             running validators to ensure fields updated properly
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`No review with the id of ${req.params.id}`, 404));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Delete  Review
// @route   DELETE /api/v1/reviews/:id
// @access  Private 
// @details: delete the review if owner of review or admin
  // same thing as previous ctrl but call, below and send empty data {}:
  //  'await review.remove()'
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`No review with the id of ${req.params.id}`, 404));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to delete review`, 401));
  }

  await review.remove();

  res.status(201).json({
    success: true,
    data: {}
  });
});