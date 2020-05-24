var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var itemSchema = new Schema({
  createdOn: String,
  data: Object,
  list_id: String,
  user_id: String
});


module.exports = mongoose.model("item", itemSchema);