var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var itemSchema = new Schema({
    createdOn: String,
    data: Object,
    list_id: String,
    user_id: String
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