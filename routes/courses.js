const express = require('express');
const router = express.Router({ mergeParams: true });
// to send course Id and bootcamp Id in url params

// Controllers
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');
// Models
const Course = require('../models/Course');
// Middleware
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Routes
// -----------

// Get courses & add course
router
  .route('/')
  .get(
    advancedResults(Course, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getCourses
  )
  .post(protect, authorize('publisher', 'admin'), addCourse);

// Get, update & delete course
router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;
