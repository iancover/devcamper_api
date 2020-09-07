// @details: handles params passed on query for sorting, pagination, for our models
  // by default gets all with all fields, but to get specific fields must handle params
  // - 'asyncHandler()': takes in a function that needs to be run asynchrously
  //                   'asyncHandler(async function(req, res, next){})'
  // - declare a var 'query' (not same as 'req.query')
  // - bring in the 'request query' which is a JSON
  // - create array of fields/params to filter out or exclude
  // - loop thru those fields 'delete reqQuery[param]' will delete the 
  //   key/value pair that matches that param/field
  // - turn JSON query str to string
  // - add the '$' to query keywords [in] for MongoDB to read 
  // - save to query var passing query str parsed as JSON to model 
  //   to search bootcamps/courses in db 'Bootcamp.find()' that meet criteria then
  // - populate(): which links a virtual to get array of courses per bootcamp
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

const advancedResults = (model, populate) => async (req, res, next) => {
  let query;
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);
   
  // create query string
  let queryStr = JSON.stringify(reqQuery);

  // create mongoDB operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // find resourses and populate courses w/virtual
    // query = model.find(JSON.parse(queryStr)).populate('courses'); 
    // dont need populate here, but left so could see where it was before this
    // code became middleware
  query = model.find(JSON.parse(queryStr));

  // select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  } 
  // sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  
  // pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  // executing query
  query = query.skip(startIndex).limit(limit); // 'skip().limt()': mongoose for pagination

  if (populate) {
    query = query.populate(populate);
  } 
  
  const results = await query;
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

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };

  // since its middleware
  next(); 
};

module.exports = advancedResults;