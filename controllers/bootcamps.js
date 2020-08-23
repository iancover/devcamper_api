// Bootcamps REST API
  // this module controls the CRUD requests
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get all bootcamps (or specific bootcamps with query params)
  // @route   GET /api/v1/bootcamps
  // @access  Public 
  // @details: by default gets all with all fields, but to get specific fields
    // - declare a var 'query' (not same as 'req.query')
    // - bring in the 'request query' which is a JSON
    // - create array of fields/params to filter out or exclude
    // - loop thru those fields 'delete reqQuery[param]' will delete the 
    //   key/value pair that matches that param/field
    // - turn JSON query str to string
    // - add the '$' to query keywords [in] for MongoDB to read 
    // - save to query var passing query str parsed as JSON to model 
    //   to search bootcamps in db 'Bootcamp.find()' that meet criteria
    // - if there is a 'select', then we want to be able to pass the fields 
    //   to mongoose method '.select()' because this method takes string 
    //   separated by spaces 'name description etc' so we use 'split().join()'
    //   then we can pass to 'select()'
    // - then if 'sort' param we want to be able to sort using 'req.query.sort' and 'sort()'
    //   or sort by date created by default, in descending order add '-' ex '-createdAt'
    // - for pagination, and number of pages we parse the num with a radix of 10, or page 1 by default
    //   and same for the limit of bootcamps per page and to skip to a page
    // - save query to 'bootcamps' and pass as 'data'
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  query = Bootcamp.find(JSON.parse(queryStr));

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
  const limit = parseInt(req.query.limit, 10) || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);
  
  const bootcamps = await query;

  // pagination result
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
  // reminder: when 'key === value' or 'key === variable'  -> just use 'key'
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
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
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