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
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

// @desc    Update Bootcamp
  // @route   PUT /api/v1/bootcamps/:id
  // @access  Private
  // @details
    // - async findByIdAndUpdate( id, update data, options)
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Delete Bootcamp
  // @route   DELETE /api/v1/bootcamps/:id
  // @access  Private
  // @details
    // [opt]: const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    // - we dont use this one so we can apply middleware 'pre('remove')' triggered on 'bootcamp.remove()' 
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {

  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
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
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
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