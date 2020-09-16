// Bootcamps REST API
  // this module controls the CRUD requests async using middleware async handler
// -----------------------------------------------------------------

// Middlware & Model Import
  // ErrorResponse - helps build a response message
  // asyncHandler - helps handle middleware async using promises and catching errors
  // geocoder - middleware to use maps and geocode locations
  // Bootcamp - schema/models
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get all Bootcamps (or specific bootcamps with query params)
  // @route   GET /api/v1/bootcamps
  // @access  Public 
  // @details: handles params passed on query for sorting, pagination, etc
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single bootcamp
  // @route   GET /api/v1/bootcamps/:id
  // @access  Public 
  // @details
    // tries to return a bootcamp or returns error message
    // - tries to find bootcamp with id, because its async process will continue if error
    // - if it doesnt find one, then 'next()' handles middleware that generates err msg
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Create bootcamp
  // @route   POST /api/v1/bootcamps
  // @access  Private
  // @details 
    // - 'req.body.user = req.user.id': assigns user creating bootcamp to it
    //                    on 'BootcampSchema' we assigned field 'user', so the
    //                    'req.body' will have a user field, we're assigning the 'id' to it
    // - prevent 'user' from creating bootcamp if already has created one since only 'admin' can
    //   by checking if there is a published bootcamp by that user w/id, otherwise create bootcamp
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`), 400);
  }
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

// @desc    Update Bootcamp
  // @route   PUT /api/v1/bootcamps/:id
  // @access  Private
  // @details
    // - find the bootcamp by id
    // - make sure 'user' is the bootcamp owner or 'admin'
    // - then find by id and pass new body data, w/options 'new' to set
    //   as new data and run validators to ensure all fields are there
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401));
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Delete Bootcamp
  // @route   DELETE /api/v1/bootcamps/:id
  // @access  Private
  // @details
    // - we dont use 'findByIdAndDelete(req.params.id)' because we have midware hooks triggerd pre remove
    //   and we must also check if it exists or not for error response & make sure owner or admin is deleting 
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`, 401));
  }
  bootcamp.remove();
  res.status(200).json({ success: true, data: {} });
});


// @desc    Get Bootcamps within Radius
  // @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
  // @access  Private
  // @details
    // - get zipcode and distance from params passed
    // - use the zipcode to access the location
    // - get the latitude and longitude from geocoder
    // - calculate radius using radians, dividing distance by earth radius (3,963 mi aprox)
    // - $centerSphere: defines a circle in a sphere 
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [ [ lng, lat], radius ] } }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});

// @desc    Upload Photo for Bootcamp
  // @route   PUT /api/v1/bootcamps/:id/photo
  // @access  Private
  // @details
    // - fetch bootcamp by id, if not create error response
    // - check if authorized user to upload pic, must be 'publisher' or 'admin'
    // - if req has no 'files', also create error response
    // 
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401));
  }
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  } 
  const file = req.files.file;
  
  // Verify img is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize is too big
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
  }

  // Create custom file name
    // - wanna create unique names for files that are uploaded in case other user uploads img with same name
    //   system will override it
    // - using built-in pkg 'path' which gets file extension: 'path.parse().ext'
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});