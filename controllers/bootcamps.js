// Bootcamps REST API
  // this module controls the CRUD requests async using middleware async handler
// -----------------------------------------------------------------

// Middlware & Model Import
  // ErrorResponse - helps build a response message
  // asyncHandler - helps handle middleware async using promises and catching errors
  // geocoder - middleware to use maps and geocode locations
  // Bootcamp - schema/models
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get all Bootcamps (or specific bootcamps with query params)
  // @route   GET /api/v1/bootcamps
  // @access  Public 
  // @details: handles params passed on query for sorting, pagination, etc
    // by default gets all with all fields, but to get specific fields must handle params
    // - declare a var 'query' (not same as 'req.query')
    // - bring in the 'request query' which is a JSON
    // - create array of fields/params to filter out or exclude
    // - loop thru those fields 'delete reqQuery[param]' will delete the 
    //   key/value pair that matches that param/field
    // - turn JSON query str to string
    // - add the '$' to query keywords [in] for MongoDB to read 
    // - save to query var passing query str parsed as JSON to model 
    //   to search bootcamps in db 'Bootcamp.find()' that meet criteria
    //   & populate(): for using virtuals to get array of courses per bootcamp
    // - if there is 'select=param1,param2', we want to extract params without commas 
    //   to pass to mongoose method: .select('param1 param2') to display only certain
    //   fields which we want to extract
    // - then if 'sort=field' query we wanna sort by that field or by date by default
    //   using 'createdAt' or descending (newest first) '-createdAt'
    // - for pagination, we parse the num with a radix of 10, or set default
    //   and same for the limit of bootcamps per page and to skip to a page
    //   helpful when creating UI to click 'next'/'prev' page
    // - save query to 'bootcamps' and pass as 'data'
    // reminder: if passing obj { var1: var1, var2: var2 } can use instead { var1, var2 }
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  } 

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);
  const bootcamps = await query;
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({ 
    success: true, 
    count: bootcamps.length, 
    pagination, 
    data: bootcamps 
  });

});

// @desc    Get single bootcamp
  // @route   GET /api/v1/bootcamps/:id
  // @access  Public 
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

// @desc    Update bootcamp
  // @route   PUT /api/v1/bootcamps/:id
  // @access  Private
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

// @desc    Delete bootcamp
  // @route   DELETE /api/v1/bootcamps/:id
  // @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  //    to trigger the middleware on 'remove()' we just find by id instead then call middleware
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
  bootcamp.remove();
  res.status(200).json({ success: true, data: {} });
});


// @desc    Get bootcamps within radius
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