const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Product = require('../models/productModel')
const ErrorHander = require("../utils/errorhander");
const moment = require("moment")

exports.addToCart = async (req, res, next) => {
  try {
    const  product  = req.params.id;
    const productData = await Product.findById({_id: product})
    console.log(productData)
    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = await createCart(req.user._id);
    }
    const productName = productData.name
    const price = productData.price
    const productIndex = cart.products.findIndex((cartProduct) => {
      return cartProduct.product.toString() == product;
    });

    if (productIndex < 0) {
      cart.products.push({ product, productName , price});
    } else {
      cart.products[productIndex].quantity++;
    }

    await cart.save();

    return res.status(200).json({
      msg: "product added to cart",
    });
  } catch (error) {
    next(error);
  }
};

exports.updateQuantity = async (req, res, next) => {
  try {
    const product = req.params.id;
    const { quantity } = req.body;
    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = await createCart(req.user._id);
    }

    const productIndex = cart.products.findIndex((cartProduct) => {
      return cartProduct.product.toString() == product;
    });

    if (productIndex < 0 && quantity > 0) {
      cart.products.push({ product, quantity });
    } else if (productIndex >= 0 && quantity > 0) {
      cart.products[productIndex].quantity = quantity;
    } else if (productIndex >= 0) {
      cart.products.splice(productIndex, 1);
    }

    await cart.save();

    const cartResponse = await getCartResponse(cart);

    return res.status(200).json({
      success: true,
      msg: "cart updated",
      cart: cartResponse,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({user: req.user._id});
        if(cart){
          const cartResponse = await getCartResponse(cart);
          return res.status(200).json({
              success: true,
              msg: "cart",
              cart: cartResponse
          })
        }else{
            next(new ErrorHander("Cart is Empty.", 404))
        }
    } catch (error) {
        next(error);
    }
}

exports.applyCoupon = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({user: req.user._id});

        const coupon = await Coupon.findOne({
            couponCode: req.body.couponCode,
            expirationDate: {$gte: new Date(moment().format("YYYY-MM-DD"))},
            activationDate: {$lte: new Date(moment().format("YYYY-MM-DD"))}
        })
        console.log("coupon",coupon)
        console.log("cartCoupon",cart)

        if(!coupon){
            next(new ErrorHander("invalid coupon code", 400))
        }
   
        cart.coupon = coupon._id;

        await cart.save();

        return res.status(200).json({
            success: true,
            msg: "coupon applied successfully"
        })
     
    } catch (error) {
        console.log(error);
        next(error);
       
    }
}

const createCart = async (userId) => {
  try {
    const cart = await Cart.create({ user: userId });

    return cart;
  } catch (error) {
    throw error;
  }
};

const getCartResponse = async (cart) => {
  try {
    await cart.populate([
      { path: "products.product", select: { reviews: 0 } },
      { path: "products.product.category", select: { reviews: 0 } },
      { path: "coupon", select: "couponCode discount expirationDate" },
    ]);

    if (cart.coupon && moment().isAfter(cart.coupon.expirationDate, "day")) {
      cart.coupon = undefined;
      cart.save();
    }
    const cartResponse = cart.toObject();

    let discount = 0;
    let total = 0;
    cartResponse.products.forEach((cartProduct) => {
      cartProduct.total = cartProduct.product.price * cartProduct.quantity;
      total += cartProduct.total;
    });

    if (cartResponse.coupon) {
      discount = 0.01 * cart.coupon.discount * total;
    }

    cartResponse.subTotal = total;
    cartResponse.discount = discount;
    cartResponse.total = total - discount;
    cartResponse.shipping = 10;

    return cartResponse;
  } catch (error) {
    throw error;
  }
};
exports.DeleteCart = async(req,res) => {
  try{
    const cart = await Cart.findOne({user: req.user._id});
      const deleteCart = await Cart.findByIdAndDelete({ _id: cart._id });
      res.status(200).json({
          message: "Delete Cart ",
      },)
  }catch(err){
      res.status(400).json({
          message: err.message
      })
  }
}