const mongoose = require("mongoose");
const schema = new mongoose.Schema(
    {
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        amount: {
            type: Number,
        },
        image: {
            type: String,
        },
    },
    { timeseries: true }
);
module.exports = mongoose.model("offer", schema);
