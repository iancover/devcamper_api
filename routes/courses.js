
const express = require('express');

const { getCourses } = require('../controllers/courses');

// Must merge url params to pass bootcamp id from bootcamps router
const router = express.Router({ mergeParams: true });

router.route('/').get(getCourses);

module.exports = router;