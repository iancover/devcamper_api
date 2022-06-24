// Middleware
const asyncHandler = require('../middleware/async');
// Models
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');
// Utilities
const ErrorResponse = require('../utils/errorResponse');

// @desc      GET  Reviews
// @access    Public
// @route     /api/v1/reviews
// @route     /api/v1/bootcamps/:bootcampId/reviews
// @details   get reviews for bootcamp if id present, otherwise all reviews
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      GET  Review
// @route     /api/v1/reviews/:id
// @access    Public
// @details   get review and the bootcamp's info
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  if (!review) {
    const msg = `No review found with the id of ${req.params.id}`;
    return next(new ErrorResponse(msg, 404));
  }
  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc      POST  Add review
// @route     /api/v1/bootcamps/:bootcampId/reviews
// @access    Private
// @details   add review to bootcamp by id and user id
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  // verify bootcamp
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }
  // create in db
  const review = await Review.create(req.body);
  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc      PUT Update review
// @access    Private
// @route     /api/v1/reviews/:id
// @details   verify auth user and update review
exports.updateReview = asyncHandler(async (req, res, next) => {
  // verify review
  let review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }
  // verify access
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }
  // update db & return updated
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc      DELETE  Review
// @access    Private
// @route     /api/v1/reviews/:id
// @details   verify review, access, then delete
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to delete review`, 401));
  }
  // remove from db
  await review.remove();
  res.status(200).json({
    success: true,
    data: {},
  });
});
