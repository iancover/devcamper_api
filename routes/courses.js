
const express = require('express');

const { 
  getCourses, 
  getCourse, 
  addCourse, 
  updateCourse, 
  deleteCourse 
} = require('../controllers/courses');

const Course = require('../models/Course');
const advancedResults = require('../middleware/advancedResults');

// Router Setup
  // - must merge url params to pass bootcamp id from bootcamps router
  //   so controllers can get the courses of a bootcamp
const router = express.Router({ mergeParams: true });

// Protect Routes Middleware
  // anywhere the user must be logged in, we pass this middleware
  // - user needs to be logged in to: create, update & delete courses
const { protect } = require('../middleware/auth');

// Route: Add Course
  // - route to get courses applying 'advancedResults()' middleware to just get 'name' & 'desc' of course
  //   maintaining 'path' to the bootcamp it belongs
  // - route to create course, 'protect' so only logged in user can
router
  .route('/')
  .get(advancedResults(Course, {
    path: 'bootcamp',
    select: 'name description'
  }), getCourses)
  .post(protect, addCourse);
  
// Route: Update & Delete Course
  // - gets course w/id updates or deletes, 'protect' so only logged in user can do it
router
  .route('/:id')
  .get(getCourse)
  .put(protect, updateCourse)
  .delete(protect, deleteCourse);

module.exports = router;