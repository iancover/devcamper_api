// Data Seeder
  // this module connects to db, seeds and destroys data from '/_data' 
  // fs - node module that provides API to interact with file system
  // mongoose - to connect to db
  // dotenv - import env variables
  // colors - to style terminal logs
  // Bootcamp - import models
  // bootcamps - reads file system accessing /_data/bootcamps.json synchronously
  // importData - import data from there into db asynchronously
  // deleteData - destroy data from db
  // so before running app we wanna temp data into db running 'node seeder -i'
  // process.argv[] -  is an array ['node', 'seeder', '-i']
  // so if process.argv[2] === '-i' import data or if '-d' destroy data
const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));

const importData = async () => {
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

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}



 