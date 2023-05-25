const Product = require("../models/productModel");
const Category = require("../models/CategoryModel");
const ObjectId = require("mongodb").ObjectID;
const Wishlist = require("../models/WishlistModel");
const mongoose = require("mongoose");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");
const { multipleFileHandle } = require("../utils/fileHandle");
const xlsx = require("xlsx");
const fs = require("fs");
// Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    try {
        // const imagesLinks = await multipleFileHandle(req.files,req);

        // req.body.images = imagesLinks;
        req.body.user = req.user.id;
        const data = {
            user: req.user.id,
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            images: req.body.images,
            category: req.body.category,
            Stock: req.body.Stock,
        };
        const product = await Product.create(data);

        res.status(201).json({
            success: true,
            product,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
});

// Get All Product
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    try {
        const resultPerPage = 50;
        const productsCount = await Product.countDocuments();
        let demoProduct = await Product.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $unwind: "$category",
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    ratings: 1,
                    review: 1,
                    category: "$category.parentCategory",
                },
            },
        ]);

        const apiFeature = new ApiFeatures(
            Product.find().populate("category"),
            req.query
        )
            .search()
            .filter();

        let products = await apiFeature.query;

        let filteredProductsCount = products.length;

        apiFeature.pagination(resultPerPage);

        res.status(200).json({
            success: true,
            products,
            demoProduct,
            productsCount,
            resultPerPage,
            filteredProductsCount,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
});

// Get All Product (Admin)
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
    try {
        const products = await Product.find().populate("category");

        res.status(200).json({
            success: true,
            products,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
});

// Get Product Details
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new ErrorHander("Product not found", 404));
        }

        res.status(200).json({
            success: true,
            product,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
});

// Update Product -- Admin

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return next(new ErrorHander("Product not found", 404));
        }

        // Images Start Here
        console.log(req.body.images);
        let images = [];

        if (req.body.images) {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }

        // if (images !== undefined) {
        //   // Deleting Images From Cloudinary
        //   for (let i = 0; i < product.images.length; i++) {
        //     await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        //   }

        //   const imagesLinks = [];

        //   for (let i = 0; i < images.length; i++) {
        //     const result = await cloudinary.v2.uploader.upload(images[i], {
        //       folder: "products",
        //     });

        //     imagesLinks.push({
        //       public_id: result.public_id,
        //       url: result.secure_url,
        //     });
        //   }

        //   req.body.images = imagesLinks;
        // }

        product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                category: req.body.category,
            },
            {
                new: true,
                runValidators: true,
                useFindAndModify: false,
            }
        );

        res.status(200).json({
            success: true,
            product,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
});

// Delete Product

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    // // Deleting Images From Cloudinary
    // for (let i = 0; i < product.images.length; i++) {
    //   await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    // }

    await product.remove();

    res.status(200).json({
        success: true,
        message: "Product Delete Successfully",
    });
});

// Create New Review or Update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating), (rev.comment = comment);
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
});

// Get All Reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;

    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let ratings = 0;

    if (reviews.length === 0) {
        ratings = 0;
    } else {
        ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
    });
});

exports.createWishlist = catchAsyncErrors(async (req, res, next) => {
    const product = req.params.id;
    let wishList = await Wishlist.findOne({ user: req.user._id });
    if (!wishList) {
        wishList = new Wishlist({
            user: req.user,
        });
    }
    wishList.products.addToSet(product);
    await wishList.save();
    res.status(200).json({
        message: "product addedd to wishlist Successfully",
    });
});

exports.removeFromWishlist = catchAsyncErrors(async (req, res, next) => {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
        return next(new ErrorHander("Wishlist not found", 404));
    }
    const product = req.params.id;

    wishlist.products.pull(new mongoose.Types.ObjectId(product));

    await wishlist.save();
    res.status(200).json({
        success: true,
        message: "Removed From Wishlist",
    });
});

exports.myWishlist = catchAsyncErrors(async (req, res, next) => {
    let myList = await Wishlist.findOne({ user: req.user._id }).populate(
        "products"
    );

    if (!myList) {
        myList = await Wishlist.create({
            user: req.user._id,
        });
    }
    res.status(200).json({
        success: true,
        wishlist: myList,
    });
});

exports.getProductByCategory = catchAsyncErrors(async (req, res, next) => {
    try {
        const producyBycategory = await Product.find({
            category: req.params.id,
        });

        res.status(200).json({
            message: "get Successfully",
            data: producyBycategory,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

exports.uploadthroughExcel = async (req, res) => {
    try {
        const workbook = xlsx.readFile(req.file.path);
        const sheet_name_list = workbook.SheetNames;
        const data = xlsx.utils.sheet_to_json(
            workbook.Sheets[sheet_name_list[0]]
        );
        for (let i = 0; i < data.length; i++) {
            let findCategory;
            if (data[i].category != (null || undefined)) {
                findCategory = await Category.findOne({
                    name: data[i].category,
                });
                if (!findCategory) {
                    response(res,ErrorCode.NOT_FOUND,{},"Category data not found.");
                }
            }
            const product = new Product({
                user: req.user.id,
                name: data[i].name,
                description: data[i].description,
                price: data[i].price,
                images: data[i].images,
                category: findCategory._id,
                Stock: data[i].Stock,
            });
            console.log(product);
            let a = await product.save();
            console.log("----------------",a);
        }
        fs.unlink(req.file.path, (err) => {
            if (err) throw err;
            console.log("Uploaded file deleted");
        });
        res.status(200).json({ message: "Product Data is Saved " });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};
