// Dependencies
const express = require('express');
const path = require('path'); 
const dotenv = require('dotenv'); 
const morgan = require('morgan'); 
const colors = require('colors'); 
const fileUpload = require('express-fileupload'); 
const cookieParser = require('cookie-parser'); 

// Security
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet'); 
const xss = require('xss-clean'); 
const rateLimit = require('express-rate-limit'); 
const hpp = require('hpp'); 
const cors = require('cors'); 
 
// Import error middleware
const errorHandler = require('./middleware/error');

// MongoDB connection
const connectDB = require('./config/db'); 
dotenv.config({ path: './config/config.env'}); 
connectDB(); 

// Import Routers
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

// App init
const app = express();
app.use(express.json()); 
app.use(cookieParser()); 

// Log on development env
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Image uploads 'public/uploads/'
app.use(fileUpload()); // limit file size opt 'fileUpload({ limits: { fileSize: x * x * x}})'

// Security config
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(rateLimit({ windowsMs: 10 * 60 * 1000, max: 100 }));
app.use(hpp());
app.use(cors());

// Path to static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes to endpoints
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

// Error msg middleware
app.use(errorHandler);

// Setup server
const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT, 
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// Close server on error
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});
