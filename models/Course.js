// COURSES SCHEMA & MODEL
// ------------------------

const mongoose = require('mongoose');

// Course Schema
  // createdAt: {} -  is a 'Date' object and it sets it the moment the doc is created
  // bootcamp: {} - connects the course to the bootcamp referencing it with
  //                type: mongoose.Schema.ObjectId
  //                ref: 'Bootcamp'
const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course description']
  },
  description: {
    type: String,
    required: [true, 'Please add a course description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add tuition cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// Avg Cost Static Method
  // - remember 'static' methods are applied by the schema on the model
  //   and not what the model creates
  // - so when the model gets created this updates the tuition cost
  //   by averaging out the aggregated tuition amts based on amt of courses
CourseSchema.statics.getAverageCost = async function(bootcampId) {
  const obj = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    { $group: { _id: '$bootcamp', averageCost: { $avg: '$tuition' } } }
  ]);
  
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost/10) * 10
    });
  } catch (err) {
    console.log(err);
  }
};

// Average Cost Middleware
  // - on 'Course.create()' creating new course document we want to call 'getAverageCost()'
  // - and on 'Course.remove()' we want to recalculate so also call 'getAverageCost()'

CourseSchema.post('save', function() {
  this.constructor.getAverageCost(this.bootcamp);
});

CourseSchema.pre('remove', function() {
  this.constructor.getAverageCost(this.bootcamp);
});


module.exports = mongoose.model('Course', CourseSchema);