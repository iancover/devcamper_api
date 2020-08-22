const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
    trim: true,
    maxLength: [50, 'Name can not be more than 50 characters']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxLength: [500, 'Description can not be more than 500 characters']
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL with HTTP or HTTPS' 
    ]
  },
  phone: {
    type: String,
    maxLength: [20, 'Phone number can not be longer than 20 characters']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String,
    street: String,
    city: String,
    zipcode: String,
    country: String
  },
  careers: {
    type: [String],
    enum: [
      'Web Development',
      'Mobile Development',
      'UI/UX',
      'Data Science',
      'Business',
      'Other'
    ]
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating can not be more than 10']
  },
  averageCost: Number,
  photo: {
    type: String,
    default: 'no-photo.jpg'
  },
  housing: {
    type: Boolean,
    default: false
  },
  jobAssistance: {
    type: Boolean,
    default: false
  },
  jobGuarantee: {
    type: Boolean,
    default: false
  },
  acceptGi: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create Bootcamp Slug from the Name
BootcampSchema.pre('save', function(next) {
  // console.log('Slugify ran', this.name);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Geocode & Create Location Field
BootcampSchema.pre('save', async function(next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  };
  next();
});

this.address = undefined;

module.exports = mongoose.model('Bootcamp', BootcampSchema);

// notes:
  // slug: is a 'url' friendly string, ex. for a Devcentral Bootcamp, would use '/devcentral-bootcamp'
  // match url regex -> google 'javascript regex url', stackoverflow post: 'What is a good...for HTTP/HTTPS'
  // regex:
    // entire regex goes inside '/ /'
    // https?                           -possibly 'http' or 'https'
    // :\/\/                            -then '://'
    // (www\.)?                         -then possibly 'www.'
    // [-a-zA-Z0-9@:%._\+~#=]{1,256}    -then up to 1,256 alphanum chars including '@:%._\+~#='
    // \.[a-zA-Z0-9()]{1,6}             -then a '.' followed by from 1 to 6 alphanum chars or '()'
    // \b                               -then a word boundary
    // ([-a-zA-Z0-9()@:%_\+.~#?&//=]*)  -then any alphanum char including '()@:%_\+.~#?&//=' indefinitely '*'
  // match email regex (brad used)
    // ^                    -begins
    // \w+([\.-]?\w+)*      -word chars, possibly '.' or '-' and indefinite amt of word chars
    // @                    -then '@' sign
    // \w+([\.-]?\w+)*      -then word chars, possibly '.' or '-' and indefinite amt of word chars
    // (\.\w{2,3})+         -then '.' followed by 2 or 3 word chars plus
    // $                    -ends
    //    or google 'javascript regex email', stackoverflow post: 'How to validate an email...'
    //      optional regex:
    //      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/