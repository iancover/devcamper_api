
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get All Courses
  // @route   GET /api/v1/bootcamps/:bootcampId/courses
  // @route   GET /api/v1/courses
  // @access  Public 
  // @details
    // this is for either seeing courses for a bootcamp or seeing list of all courses
    // - if there is a bootcamp id in request params, fetch courses associated w that bootcamp
    //   'Course' schema has 'bootcamp' field w/ 'mongoose.Schema.ObjectId', to relate course/bootcamp
    //   use 'return' to send response data and end process
    // - else send response with 'advancedResults' to view all courses
exports.getCourses = asyncHandler(async (req, res, next) => {
  
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });

  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get One Course
  // @route   GET /api/v1/courses/:id
  // @access  Public 
  // @details
    // - fetching the course by id and populating the 'path: 'bootcamp' it belongs to
    //   also 'name & desc' of course
    // - if course doesn't exist, create error response
    // - otherwise send response with 'course' data 
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Add Course
  // @route   POST /api/v1/bootcamps/:bootcampId/courses
  // @access  Private 
  // @details
    // - 'req.body.bootcamp = req.params.bootcampId': assigns the course to the bootcamp
    //                   remember 'CourseSchema' has a 'bootcamp' field to reference course
    //                   thats what this handles
    // - same thing to relate course to 'user'
    // - then we're fetching that bootcamp with id and if doesn't exist creating error response
    //   otherwise creating the course sending data
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404)
    );
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`, 401)
    );
  }
  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Update Course
  // @route   PUT /api/v1/courses/:id
  // @access  Private 
  // @details
    // - fetch course with id & if doesn't exist to create error response
    // - if user is not owner or admin do error response
    // - otherwise fetch and update '[document].findByIdAndUpdate(id, body, options)'
    //   'new: true' since its the updated and 'runValidators' to check all fields are there
    // - send response data
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course found with the id of ${req.params.id}`, 404)
    );
  }

  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update course ${course._id}`, 401)
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Delete Course
  // @route   DELETE /api/v1/courses/:id
  // @access  Private 
  // @details
    // - fetch course by id & create error response if doesn't exist
    // - if 'course.user' (CourseSchema has relation 'mongoose.Schema.ObjectId'), so if
    //   not equal to user id or role = 'admin' do error response
    // - otherwise remove it and send response data
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course found with the id of ${req.params.id}`, 404)
    );
  }

  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to delete course ${course._id}`, 401)
    );
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});