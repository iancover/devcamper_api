// Data Seeder
  // this module connects to db, seeds and destroys data from '/_data' 
// --------------------------------------------------

// Modules Imported
    //  fs - node module that provides API to interact with file system
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

// Synch Import Data
  // indicating dir, use 'fs' to synchronously get data
  // JSON.parse() - data is imported as string, so must parse as JSON 
  // fs.readFileSync() - read file system synch, indicate dir & utf type
  // __dirname - use this variable in case you change name of directory + dir
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));

// Async Seed/Delete Data
  // seed/destroy data using try/catch for error handling, colored logs & exit process, or log error
  // importData()
    // async so must use 'await'
    // Model.create() - creates records with data imported using models
  // deleteData()
    // async so must use 'await'
    // Model.deleteMany() - when passed empty deletes all of them
  // process.argv[] - specifies arguments to run each function
    // process = running module with node 'node seeder'
    // argv = makes array of characters after process, so we specify
    //        if index 2 is '-s' runs 'seedData()', if '-d' runs 'deleteData()'
const seedData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    console.log('Data Destroyed...'.red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '-s') {
  seedData();
} else if (process.argv[2] === '-d') {
  deleteData();
}



 