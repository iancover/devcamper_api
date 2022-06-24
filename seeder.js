const fs = require('fs'); // Node built-in
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Config path to .env
dotenv.config({ path: './config/config.env' });

// Models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');

// Mongoose connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// Fetch data string synchronously
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8')
);

// Seed data async
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

// Destroy data async
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

// Manually seed/destroy data
if (process.argv[2] === '-s') {
  seedData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
