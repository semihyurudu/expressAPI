var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var listSchema = new Schema({
    name: {
      $type: String
    },
    user_id: {
      $type: String
    },
    items: {
      $type: Array
    }
  }, {
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id
        delete ret._id
      }
    }
  }
);


module.exports = mongoose.model("list", listSchema);