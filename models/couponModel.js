const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
  },
  expirationDate: {
    type: Date,
  },
  activationDate: {
    type: Date,
  },
  discount: {
    type: Number,
  },
  minOrder: {
    type: Number,
  },
});

module.exports = mongoose.model("Coupon", couponSchema);
