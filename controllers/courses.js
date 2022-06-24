// Middleware
const asyncHandler = require('../middleware/async');
// Models
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
// Utilities
const ErrorResponse = require('../utils/errorResponse');

// @desc      GET  All courses
// @route     /api/v1/bootcamps/:bootcampId/courses
// @route     /api/v1/courses
// @access    Public
// @details   get bootcamp related courses or all courses
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      GET Course by Id
// @access    Public
// @route     /api/v1/courses/:id
// @details   verify course and return
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc      POST  Add course by bootcamp Id
// @access    Private
// @route     /api/v1/bootcamps/:bootcampId/courses
// @details   add course to bootcamp if it exists
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
        401
      )
    );
  }
  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc      PUT  Update course by Id
// @access    Private
// @route     /api/v1/courses/:id
// @details   verify course and user and update course
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`No course found with the id of ${req.params.id}`, 404)
    );
  }
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update course ${course._id}`,
        401
      )
    );
  }
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc      DELETE Course by Id
// @route     /api/v1/courses/:id
// @access    Private
// @details   verify course and access, remove course by id
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`No course found with the id of ${req.params.id}`, 404)
    );
  }
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete course ${course._id}`,
        401
      )
    );
  }
  await course.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
