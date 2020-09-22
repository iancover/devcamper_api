// Devcamper API
// ----------------------

// Dependencies
  // - path: node built-in module, provides utilities for working with files and directory paths
  //         https://nodejs.org/dist/latest-v11.x/docs/api/path.html#path_path_join_paths
  // - express: to make your app, 'app = express()' ex. app.use(), app.listen()
  // - dotenv: to use environment variables using 'process.env' and to look for the vars in 'config.env'
  //           'dotenv.config(path)' so to use: 'NODE_ENV=development' ex. 'process.env.NODE_ENV'
  //           we do this to keep 'config.env' secret included in '.gitignore' file
  //           https://www.npmjs.com/package/dotenv 
  // - morgan: npm logger module (note: we created a custom logger middleware thats disabled)
  //           https://www.npmjs.com/package/morgan
  // - colors: adds colors to the console for labeling log output, 'console.log('Log string'.yellow.bold)'
  //           https://www.npmjs.com/package/colors
  // - express-fileupload: load pic files from '/public/uploads', in req obj 'req.files', 'app.use(fileUpload())'
  //           https://www.npmjs.com/package/express-fileupload
  // - cookie-parser: npm module used for using cookies 'app.use(cookieParser())', used for creating a cookie for
  //                  a web token so not have to request the token during session on every page reload
  //                 https://www.npmjs.com/package/cookie-parser
  // - express-mongo-sanitize: npm module 'npm i express-mongo-sanitize', to prevent hacker injections
  //                         https://www.npmjs.com/package/express-mongo-sanitize
  // - helmet: npm module that protects app with extra layers of security
  //            https://helmetjs.github.io/
  // - xss-clean: sanatize user input coming in from POST body, GET queries and url params
  //             https://www.npmjs.com/package/xss-clean
  // - express-rate-limit: to limit amount of requests per time or other options to protect app
  //                      https://www.npmjs.com/package/express-rate-limit
  // - hpp: helps protect against parameter pollution
  //        https://www.npmjs.com/package/hpp
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
 
// Import Error & DB Connection
  // errorHandler - middleware
  // connectDB - mongoose connection to MongoDB, used for 'db.js'
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Config Env & Connect DB
dotenv.config({ path: './config/config.env'});
connectDB();

// Import Routers
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

// App Setup
  // build express app & use middleware
  // - 'express.json()': JSON Body Parser
  // - 'cookieParser()': to use cookies with tokens
  // - 'morgan(dev)': morgan logger if on 'dev' stage to see logs
  // - 'fileUpload()': to use 'fs' pkg for accessing images on local files
  //                optional limit file size 'fileUpload({ limits: { fileSize: x * x * x}})'
  // - 'mongoSanitize()': to prevent SQL/NoSQL injections like '$gt:' for security
  // - mount router endpoints, to setup root '/'
  // - 'errorHandler': middleware to catch errors and log messages
const app = express();
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(fileUpload());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(rateLimit({ windowsMs: 10 * 60 * 1000, max: 100 }));
app.use(hpp());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);
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
