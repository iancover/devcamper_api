// USER SCHEMA & MODEL

// Dependencies
  // - crypto: node built-in module 
  //           https://nodejs.org/api/crypto.html
  // - mongoose: 'mongoose.Schema()', 'mongoose.Model()' or 'Schema.pre(hook, fn)'
  // - bcryptjs: npm module for generating salt to hash pwd, 'bcrypt.genSalt()' or 'bcrypt.hash(pwd, salt)'
  //          https://www.npmjs.com/package/bcryptjs
  // - jsonwebtoken: 
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Model
  // - name: username will be required
  // - email: in this case required and unique since you don't want duplicates
  // - role: 'user' (default role) can write reviews and 'publisher' who created bootcamp/course info
  // - password: min of 6 chars and wont 'select' since will encrypt (bcrypt, jwt)
  // - resetPasswordToken/Expire: reset pwd token (crypto)
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

// Middleware
// -----------------

// Hook: Encrypt Password
  // encrypts or 'hashes' pwd prior to saving, which is triggered on 'User.create()'
  // - if pwd is modified continue (w/resetPwdToken), otherwise create salt
  // - 'salt' is the random data that is created to hide password
  // - bcrypt.genSalt(10): generate a salt of 10 characters
  // - bcrypt.hash(pwd, salt): 'hash' password, or make pwd the salt created
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method: Create Web Token
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

// Method: Verify Password
  // - asynchronously, see if user entered password matches the hashed pwd in database
  // - used in controllers: 'login()' and 'updatePassword()'
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method: Reset Pwd Token
  // 'crypto' is a NodeJS module, docs: https://www.nodejs.org/api/crypto
  // 'token' & 'pwd token' are two diff nums
  // - 'resetToken': generate new token with random bytes in hexadecimal
  // - 'this.resetPasswordToken': resets field with hashed 'resetToken' to store in db
  // - set new expiration date
  // - return un-hashed 'resetToken'
UserSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);