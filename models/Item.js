var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var itemSchema = new Schema({
    createdOn: {
      $type: String
    },
    data: {
      $type: Object
    },
    list_id: {
      $type: String
    },
    user_id: {
      $type: String
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


module.exports = mongoose.model("item", itemSchema);