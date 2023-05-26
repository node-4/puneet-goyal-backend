const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const addressSchema = new mongoose.Schema({
  flatHouseNo: {
    type: String,
  },
  floorNo: {
    type: String,
  },
  TownNo: {
    type: String,
  },
  address: {
    type: String,
  },
  landMark: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  pinCode: {
    type: Number,
  },
  street: {
    type: String,
  },
  name:{
    type: String,
  },
  phone:{
    type: String,
  },
  saveAs:{
    type: String,
    enum: ["Home", "Work", "Other"],
  },
  user: {
    type: ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Address", addressSchema);
