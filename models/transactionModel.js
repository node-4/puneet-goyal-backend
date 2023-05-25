const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    orderId: {
        type: mongoose.Schema.ObjectId,
        ref: "Order",
    },
    date: {
        type: Date,
        default: Date.now,
    },
    amount: {
        type: Number,
    },
    paymentMode: {
        type: String,
    },
    Status: {
        type: String,
    },
});

const transaction = mongoose.model("transaction", transactionSchema);

module.exports = transaction;
