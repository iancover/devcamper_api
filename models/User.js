// User Model
  // - name: username will be required
  // - email: in this case required and unique since you don't want duplicates
  // - role: 'user' (default role) can write reviews and 'publisher' who created bootcamp/course info
  // - minlength: password has to be 6 chars minimum
  // - select: to not return the user pwd since we're gonna encrypt and create token
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// MIDDLEWARE
// -----------------

// Encrypt Password
  // encrypts or 'hashes' pwd prior to saving, which is triggered on 'User.create()'
  // - 'salt' is the random data that is created to hide password
  // - bcrypt.genSalt(10): generate a salt of 10 characters
  // - bcrypt.hash(pwd, salt): 'hash' password, or make pwd the salt created
UserSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Create Web Token
  // creates token synchronously w/jsonwebtoken that expires in 'JWT_EXPIRE' time
  // - 'methods': used on what is modeled
  // - 'jwt.sign(payload, key, options)': creats a web token which has 3 parts 'header.payload.verify-signature'
  // - 'this' represents the user, so we pass '_id' with underscore to 'jwt.sign()' 
  //   passing also env variables for secret key and expiration time (30 days) 
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Verify Password
  // - asynchronously, see if user entered password matches the hashed pwd in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('User', UserSchema);