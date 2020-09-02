
const express = require('express');

const { getCourses } = require('../controllers/courses');

// Router Setup
  // - must merge url params to pass bootcamp id from bootcamps router
  //   so controllers can get the courses of a bootcamp
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getCourses);

module.exports = router;