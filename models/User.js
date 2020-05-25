var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: String,
    email: String,
    password: String,
  }, {
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id
        delete ret._id
      }
    }
  }
);

module.exports = mongoose.model("user", userSchema);