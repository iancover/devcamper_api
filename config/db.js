// DB Connection w/Mongoose
  // this module handles connection to db
  // 'mongoose.connect()' returns a promise
  // so you can use 'async/await'
  // '.cyan.underline.bold' is 'colors' pkg
const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
};

module.exports = connectDB;