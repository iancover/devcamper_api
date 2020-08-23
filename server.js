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

// Middleware
  // import errorHandler middleware
  // import temp data
  // import env variables
  // connect to db (no need to import mongoose on main module)
  // import routes
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
dotenv.config({ path: './config/config.env'});
connectDB();
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');

// App
  // build express app & use middleware
  // use express JSON Body Parser
  // use error handler middleware
  // use morgan 'dev' option logger when on development stage
  // use endpoint as root '/' for 'bootcamps' routers
const app = express();

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount Routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

// Error Handler (must be after mount routers)
app.use(errorHandler);


// Server 
  // use port env variable or port 5000 as default
  // setup server with stage log and port
  // process.on() - handle rejections if can't connect
    // - handles any unhandled promises, ex. if unable to connect to db for any reason
    // - logs the error in '.red' using colors
    // - closes server and exits process
const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT, 
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});
