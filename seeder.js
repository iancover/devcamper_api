// DATABASE SEEDER
  // this module connects to db, seeds and destroys data from '/_data' directory
  // to run this, you must stop the server and run on console
  // to seed db: 'node seeder -s' 
  // to delte db: 'node seeder -d'
// --------------------------------------------------

// Dependencies
  //  fs - node built-in module that provides API to interact with file system
  //  mongoose - to connect to db
  //  dotenv - import env variables
  //  colors - to style terminal logs
const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Config Env Variables
  // dotenv.config() - to use env variables
dotenv.config({ path: './config/config.env' });

// Models
  // Bootcamp - import bootcamps schema/model
  // Course - import courses schema/model
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');

// Connect to DB
  // mongoose.connect(url, options) - pass the env db url and options
  // make sure to pass options: 
  //  'useNewUrlParser' - or mongoose won't parse url data correctly & cant connect
  //  'useCreateIndex' & 'useUnifiedTopology' - not familiar with these
  //  'useFindAndModify' - or this one, and this one must be false
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

// Fetch Data String Synchronously 
  // 'fs.readFileSync()': file system points to '_data/dir' dir synchronously and indicates 'utf'
  // 'JSON.parse()': data is a String and must be parsed as JSON to go into MongoDB
  // '__dirname': use this variable in case you change name of directory + dir
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));

// Seed Data Async
  // when connecting to MongoDB we always have to use promises hence why 'async/await'
  // in case there is a problem connecting/disconnecting etc
  // seed/destroy data using try/catch for error handling, colored logs & exit process, or log error
  // importData()
  // 'Model.create()': creates records with data imported using models
const seedData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
    await Review.create(reviews);
    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// Destroy Data Async
  // 'Model.deleteMany()': when passed empty deletes all of them
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data Destroyed...'.red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// Manually Seed/Destroy Data 
  // using the process' arguments we can seed or destroy data
  // 'process.argv[]': specifies arguments to run each function
    // 'process': the process that 'node' is running so 'seeder', or 'node seeder' on console
    //            note: from dir node will run any js file we instruct with 'node file.js'
    // 'argv': makes array of characters after process, so specifies:
    //        if index 2 is '-s' runs 'seedData()'
    //        if index 2 is '-d' runs 'deleteData()'
if (process.argv[2] === '-s') {
  seedData();
} else if (process.argv[2] === '-d') {
  deleteData();
}



 