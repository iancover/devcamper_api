// Devcamper API
// Dependencies
  // - express: to make your app, 'app = express()' ex. app.use(), app.listen()
  // - dotenv: to use environment variables using 'process.env' and to look for the vars in 'config.env'
  //           'dotenv.config(path)' so to use: 'NODE_ENV=development' ex. 'process.env.NODE_ENV'
  //           we do this to keep 'config.env' secret included in '.gitignore' file 
  // - morgan: is a logger middleware, note: we also created custom 'logger' middleware (disabled)
  // - colors: adds colors to the console for labeling log output
  // - connectDB: to manage connection using 'mongoose' on 'db.js'
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./config/db');

// Load env variables
dotenv.config({ path: './config/config.env'});

// Connect to database
connectDB();

// Route files
const bootcamps = require('./routes/bootcamps');

// App
const app = express();

// Dev Log Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount Routers
app.use('/api/v1/bootcamps', bootcamps);

// Port & Server
const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT, 
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// Handle Rejections
  // handles unhandled promise rejections, ex. connecting to db
  // or when changing pwd on db host
  // closes the server in case this happens and exits process
  // '.red' logs the error msg to console using 'colors' pkg
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});
