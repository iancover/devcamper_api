const mongoose = require('mongoose');

// Schema
const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the review.'],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, 'Please add some text for the review.'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10.'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

// MIDDLEWARE
// ----------------
// notes: 'statics' are called on the model

// Limit 1 review per user
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static: avg rating
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  const obj = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    { $group: { _id: '$bootcamp', averageRating: { $avg: '$rating' } } },
  ]);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating,
    });
  } catch (err) {
    console.log(err);
  }
};

// Hook: get avg rating after review added
ReviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.bootcamp);
});

// Hook: get avg rating when review removed
ReviewSchema.pre('remove', function () {
  this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);
