// Devcamper API
// ----------------------

// Dependencies
  // - express: to make your app, 'app = express()' ex. app.use(), app.listen()
  // - dotenv: to use environment variables using 'process.env' and to look for the vars in 'config.env'
  //           'dotenv.config(path)' so to use: 'NODE_ENV=development' ex. 'process.env.NODE_ENV'
  //           we do this to keep 'config.env' secret included in '.gitignore' file 
  // - morgan: is a logger middleware, note: we also created custom 'logger' middleware (disabled)
  // - colors: adds colors to the console for labeling log output
  // - connectDB: to manage connection using 'mongoose' on 'db.js'
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');

// Import Error & DB Connection
  // errorHandler - middleware
  // connectDB - mongoose connection to MongoDB
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Config Env & Connect DB
dotenv.config({ path: './config/config.env'});
connectDB();

// Import Routers
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');

// App Setup
  // build express app & use middleware
  // - JSON Body Parser
  // - morgan logger: if on 'dev' stage to see logs
  // - setup root router endpoints, to simply use '/'
  // - express-fileupload: npm pkg to upload images
  // - error handler middleware to catch errors and log messages
const app = express();
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(fileupload());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use(errorHandler);


// Server Setup
  // use port env variable or port 5000 as default
  // setup server with stage log and port 'app.listen(uri, fn)'
  // process.on() - handle rejections and 'server.close()' if can't connect
    // - handles any unhandled promises, ex. if unable to connect to db for any reason
    // - logs the error in '.red' using colors
    // - closes server and exits process (not sure why pass the 1)
const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT, 
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});
