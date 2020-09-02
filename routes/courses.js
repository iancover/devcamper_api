
const express = require('express');

const { 
  getCourses, 
  getCourse, 
  addCourse, 
  updateCourse, 
  deleteCourse 
} = require('../controllers/courses');

// Router Setup
  // - must merge url params to pass bootcamp id from bootcamps router
  //   so controllers can get the courses of a bootcamp
const router = express.Router({ mergeParams: true });

// Routes
router
  .route('/')
  .get(getCourses)
  .post(addCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(updateCourse)
  .delete(deleteCourse);

module.exports = router;