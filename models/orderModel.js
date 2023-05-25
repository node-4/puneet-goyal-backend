const mongoose = require("mongoose");

const orderProductSchema = new mongoose.Schema(
    {
        unitPrice: {
            type: Number,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        productName: {
            type: String,
        },
        quantity: {
            type: Number,
        },
        total: {
            type: Number,
        },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        address: {
            street1: {
                type: String,
            },
            street2: {
                type: String,
            },
            city: {
                type: String,
            },
            state: {
                type: String,
            },
            country: {
                type: String,
            },
        },
        products: {
            type: [orderProductSchema],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        paymentGatewayOrderId: {
            type: String,
            select: false,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
        grandTotal: {
            type: Number,
            required: true,
            default: 0,
        },
        discount: {
            type: Number,
            required: true,
            default: 0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        amountToBePaid: {
            type: Number,
            required: true,
            default: 0,
        },
        coupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon",
        },
        orderStatus: {
            type: String,
            enum: ["unconfirmed", "confirmed"],
            default: "unconfirmed",
            select: false,
        },
        delivered: {
            type: Boolean,
            default: false,
        },
        date: {
            type: Date,
            default: function () {
                return new Date();
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Order", orderSchema);
