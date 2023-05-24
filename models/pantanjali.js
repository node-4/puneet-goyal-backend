const mongoose = require("mongoose");

const pantangli = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name Category Required"],
  },
  image: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
      },
  })

module.exports = mongoose.model("pantangli", pantangli);
