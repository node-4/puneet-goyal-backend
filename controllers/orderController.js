const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const transaction = require("../models/transactionModel");
const Cart = require("../models/cartModel");
const Vender = require("../models/vendorModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Razorpay = require("razorpay");

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// Create new Order
// exports.newOrder = catchAsyncErrors(async (req, res, next) => {
//   const {
//     shippingInfo,
//     orderItems,
//     paymentInfo,
//     itemsPrice,
//     taxPrice,
//     shippingPrice,
//     totalPrice,
//   } = req.body;

//   // const productIds = orderItems.map((order) => order.product);
//   // let venders = []

//   // for (let i = 0; productIds.length > 0; i++) {
//   //   const product = await Product.findById(productIds[i]);
//   //   const vender = await Vender.aggregate([
//   //     { $match: { _id: product.user } },
//   //     { $project: { _id: 1 } },
//   //   ]);

//   // }

//   const order = await Order.create({
//     shippingInfo,
//     orderItems,
//     paymentInfo,
//     itemsPrice,
//     taxPrice,
//     shippingPrice,
//     totalPrice,
//     paidAt: Date.now(),
//     user: req.user._id,
//   });

//   res.status(201).json({
//     success: true,
//     order,
//   });
// });

// // get Single Order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    );

    if (!order) {
        return next(new ErrorHander("Order not found with this Id", 404));
    }

    res.status(200).json({
        success: true,
        order,
    });
});

// get logged in user  Orders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id }).populate(
        "user",
        "name email"
    );

    res.status(200).json({
        success: true,
        orders,
    });
});

// get all Orders -- Admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find().populate({
        path: "user",
        options: { strictPopulate: true },
    });

    let totalAmount = 0;

    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    });
});

//get all Orders - Vender
exports.getAllOrdersVender = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.aggregate([
        {
            $project: {
                orderItems: {
                    $filter: {
                        input: "$orderItems",
                        as: "newOrderItems",
                        cond: { "$$newOrderItems.venderId": req.user._id },
                    },
                },
            },
        },
    ]);

    res.status(200).json({
        success: true,
        orders,
    });
});

// // update Order Status -- Admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHander("Order not found with this Id", 404));
    }

    if (order.status === "Delivered") {
        return next(
            new ErrorHander("You have already delivered this order", 400)
        );
    }

    if (req.body.status === "Shipped") {
        order.orderItems.forEach(async (o) => {
            await updateStock(o.product, o.quantity);
        });
    }
    if (req.body.paymentStatus != (null || undefined)) {
        order.paymentStatus = req.body.paymentStatus;
    } else {
        order.paymentStatus = order.paymentStatus;
    }
    order.status = req.body.status;

    if (req.body.status === "Delivered") {
        order.date = Date.now();
    }
    if (req.body.delivered === true) {
        order.date = Date.now();
        order.delivered = req.body.delivered;
    }
    if (req.body.delivered === false) {
        order.date = Date.now();
        order.delivered = req.body.delivered;
    }
    await order.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
    });
});

async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    product.Stock -= quantity;

    await product.save({ validateBeforeSave: false });
}

// // delete Order -- Admin
// exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
//   const order = await Order.findById(req.params.id);

//   if (!order) {
//     return next(new ErrorHander("Order not found with this Id", 404));
//   }

//   await order.remove();

//   res.status(200).json({
//     success: true,
//   });
// });

exports.checkout = async (req, res, next) => {
    try {
        await Order.findOneAndDelete({
            user: req.user._id,
            orderStatus: "unconfirmed",
        });

        const { address } = req.body;

        const cart = await Cart.findOne({ user: req.user._id })
            .populate({
                path: "products.product",
                select: { review: 0 },
            })
            .populate({
                path: "coupon",
                select: "couponCode discount expirationDate",
            });

        const order = new Order({ user: req.user._id, address });

        let grandTotal = 0;

        const orderProducts = cart.products.map((cartProduct) => {
            const total = cartProduct.quantity * cartProduct.product.price;
            grandTotal += total;

            return {
                product: cartProduct.product._id,
                unitPrice: cartProduct.product.price,
                productName: cartProduct.productName,
                quantity: cartProduct.quantity,
                total,
            };
        });
        console.log(orderProducts);
        order.products = orderProducts;

        if (cart.coupon) {
            order.coupon = cart.coupon._id;
            order.discount = 0.01 * cart.coupon.discount * grandTotal;
        }

        order.grandTotal = grandTotal;
        order.shippingPrice = 10;
        order.amountToBePaid =
            grandTotal + order.shippingPrice - order.discount;

        const orderDetails = await order.save();

        await order.populate([
            { path: "products.product", select: { reviews: 0 } },
            {
                path: "coupon",
                select: "couponCode discount expirationDate",
            },
        ]);

        return res.status(200).json({
            success: true,
            msg: "order created",
            orderDetails,
        });
    } catch (error) {
        next(error);
    }
};

exports.placeOrder = async (req, res, next) => {
    try {
        const order = await Order.findOne({
            user: req.user._id,
            orderStatus: "unconfirmed",
        });

        const amount = order.amountToBePaid;

        const orderOptions = {
            amount: amount * 100,
            currency: "INR",
        };

        const paymentGatewayOrder = await razorpayInstance.orders.create(
            orderOptions
        );

        order.paymentGatewayOrderId = paymentGatewayOrder.id;
        order.orderStatus = "confirmed";
        await order.save();
        return res.status(200).json({
            msg: "order id",
            orderId: paymentGatewayOrder.id,
            amount: amount * 100,
        });
    } catch (error) {
        next(error);
    }
};

exports.getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({
            user: req.user._id,
            orderStatus: "confirmed",
        })
            .populate({
                path: "products.product",
                select: {
                    reviews: 0,
                },
            })
            .populate({
                path: "coupon",
                select: "couponCode discount expirationDate",
            });

        return res.status(200).json({
            success: true,
            msg: "orders of user",
            orders,
        });
    } catch (error) {
        next(error);
    }
};

exports.totalOrders = async (req, res) => {
    try {
        const data = await Order.find();
        res.status(200).json({
            totalOrders: data.length,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};
exports.createTransaction = async (req, res, next) => {
    try {
        const order = await Order.findOne({ _id: req.params.id });
        let obj = {
            user: req.user._id,
            orderId: order._id,
            date: Date.now(),
            amount: req.body.amount,
            paymentMode: req.body.paymentMode,
            Status: req.body.status,
        };
        const data = await transaction.create(obj);
        if (data) {
            order.paymentGatewayOrderId = req.body.payId;
            order.orderStatus = "confirmed";
            await order.save();
            return res.status(200).json({ msg: "order id", data: data });
        }
    } catch (error) {
        next(error);
    }
};
exports.createTransactionbyAdmin = async (req, res, next) => {
    try {
        const order = await Order.findOne({ _id: req.params.id });
        console.log(order, order.user);
        let obj = {
            user: order.user,
            orderId: order._id,
            date: Date.now(),
            amount: req.body.amount,
            paymentMode: req.body.paymentMode,
            Status: req.body.status,
        };
        const data = await transaction.create(obj);
        if (data) {
            order.orderStatus = "confirmed";
            await order.save();
            return res.status(200).json({ msg: "order id", data: data });
        }
    } catch (error) {
        next(error);
    }
};
exports.allTransaction = async (req, res) => {
    try {
        const data = await transaction.find().populate("user orderId");
        res.status(200).json({ totalOrders: data });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.allTransactionUser = async (req, res) => {
    try {
        const data = await transaction
            .find({ user: req.user._id })
            .populate("user orderId");
        res.status(200).json({ totalOrders: data.length });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
