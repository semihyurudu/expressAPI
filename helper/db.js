var mongoose = require("mongoose");

module.exports = () => {
  mongoose.connect("mongodb://localhost:37017/vision", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  mongoose.connection.on('open', () => {
    console.log('MongoDB: Connected');
  });
  mongoose.connection.on('error', (err) => {
    console.log('MongoDB: Error', err);
  });

  mongoose.Promise = global.Promise;
}