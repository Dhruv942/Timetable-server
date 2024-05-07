const mongoose = require("mongoose");

const AddfcSchema = new mongoose.Schema({
  fcname: String,
  fcnumber: String,
  fcemail: String,
  fcphone: String,
});

module.exports = mongoose.model("fac", AddfcSchema);
