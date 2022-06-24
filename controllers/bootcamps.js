// BOOTCAMP CONTROLLERS
// -------------------------
  // Controller modules for the bootcamps
  // 'exports.myController =': uses CommonJS 'exports' statement to export 'myController' as a module
  // 

// Dependencies
  // path - node built-in module for working with local directories, (used to parse file.name)
  // ErrorResponse - helps build a response message
  // asyncHandler - helps handle middleware async using promises and catching errors
  // geocoder - middleware to use maps and geocode locations
  // Bootcamp - schema/models
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// Controllers
// ------------------
// @route   GET /api/v1/bootcamps
// @desc    All Bootcamps
// @access  Public 
/** @details: gets all the bootcamps, use a response middleware to manage query params
  *         'advancedResults': handles params passed on query for sorting, pagination, etc
  */ 
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @route   GET /api/v1/bootcamps/:id
// @desc    Single Bootcamp
// @access  Public 
/**@details: tries to return a bootcamp or returns error message
  * - tries to find bootcamp with id, because its async process will continue if error
  * - if it doesnt find one, then 'next()' handles middleware that generates err msg
  */
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: bootcamp });
});
  
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @desc    Area Defined Bootcamps
// @access  Private
/**@details: uses geocoder api to create bootcamp search area
  * - get zipcode and distance from params passed
  * - use the zipcode to access the location
  * - get the latitude and longitude from geocoder
  * - calculate radius using radians, dividing distance by earth radius (3,963 mi aprox)
  * - $centerSphere: defines a circle in a sphere 
  */
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


// @route   POST /api/v1/bootcamps
// @desc    Create Bootcamp
// @access  Private
/**@details 
  * - 'req.body.user = req.user.id': assigns user creating bootcamp to it
  *                    on 'BootcampSchema' we assigned field 'user', so the
  *                    'req.body' will have a user field, we're assigning the 'id' to it
  * - prevent 'user' from creating bootcamp if already has created one since only 'admin' can
  *   by checking if there is a published bootcamp by that user w/id, otherwise create bootcamp
  */
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`), 400);
  }
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({ success: true, data: bootcamp });
});


// @route   PUT /api/v1/bootcamps/:id
// @desc    Update Bootcamp
// @access  Private
/**@details: checks if user is allowd to update and updates bootcamp
  * - find the bootcamp by id
  * - make sure 'user' is the bootcamp owner or 'admin'
  * - then find by id and pass new body data, w/options 'new' to set
  *   as new data and run validators to ensure all fields are there
  */
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

// @route   PUT /api/v1/bootcamps/:id/photo
// @desc    Upload Image for Bootcamp
// @access  Private
/**@details: names image file, uploads and stores, linked to bootcamp by id
  * - fetch bootcamp by id, if not create error response
  * - check if authorized user to upload pic, must be 'publisher' or 'admin'
  * - 'req.files': if request has no files, also create error response
  *               note: request object has a files field 'req.files', when uploading a file
  *               'app.use(fileUpload())' on 'server.js' allows upload 
  * - 'req.files.file': the file uploaded will be labeled 'file', and should have a 'mimetype' that should
  *                     start with 'image' if its a 'jpg', 'jpeg', etc. check response on Postman or console log
  *                     if 'mimetype' doesn't start with 'image' then create error response
  * - 'file.size': check limit file size upload, (can also set limit w/fileUpload({ limits: { x * x * x }}))
  * - 'file.name': create unique file name to prevent user upload img with same name
  *               in which case system replaces to latest uploaded and we don't want that
  *               'photo_${bootcamp._id}${path.parse(file.name).ext}' 
  *               'photo_' + 'bootcamp._id': (5d725a1b7b292f5f8ceff788) + 'path.parse(file.name).ext': (jpg)
  *               creates -> 'photo_5d725a1b7b292f5f8ceff788.jpg'
  * - 'file.mv(path, fn)': move to path or name path 'file.mv('./public/uploads', async fn())'
  *                       because 'process.env' points to '/config/config.env'
  *                       'FILE_UPLOAD_PATH= ./public/uploads'
  * - 'Bootcamp.findByIdAndUpdate(id,data)': remember Bootcamp model has field we're updating
  *                                         'photo: { type: String, default: 'no-photo.jpg' }'
  *                                        and the endpoint/route is: /api/v1/bootcamps/:id/photo
  */
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
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
  }
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


// @route   DELETE /api/v1/bootcamps/:id
// @desc    Delete Bootcamp
// @access  Private
/**@details: checks if user is allowed to delete first and deletes bootcamp
  * - we dont use 'findByIdAndDelete(req.params.id)' because we have midware hooks triggerd pre remove
  *   and we must also check if it exists or not for error response & make sure owner or admin is deleting
  */ 
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


