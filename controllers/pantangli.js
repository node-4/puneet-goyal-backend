const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const category = require("../models/CategoryModel");
const SubCategory = require("../models/SubCategory");
const xlsx = require("xlsx");
const { singleFileHandle } = require("../utils/fileHandle");

exports.createCategory = catchAsyncErrors(async (req, res, next) => {
    try {
        //   req.body.iamge = `${process.env.IMAGE_BASE_URL}/${req.file.filename}`
        console.log(req.body.image);
        const data = {
            name: req.body.name,
            image: req.body.image,
            type: "Non Patanjali",
        };
        const Category = await category.create(data);
        res.status(201).json({
            success: true,
            Category,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
});

exports.getCategory = catchAsyncErrors(async (req, res, next) => {
    try {
        const categories = await category.find({ type: "Non Patanjali" });
        res.status(201).json({
            message: categories,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
});

exports.updateCategory = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const findCategory = await category.findById(id);
    if (!findCategory) new ErrorHander("Category Not Found !", 400);
    let product = await category.findByIdAndUpdate(id,{name: req.body.name || findCategory.name,image: req.body.image|| findCategory.image,type: findCategory.type,},{new: true,});
res.status(200).json({ message: "Updated Successfully" });
});

exports.removeCategory = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await category.findById(id);

        if (!category) new ErrorHander("Category Not Found !", 404);

        const subCategory = await SubCategory.find({ parentCategory: id });

        subCategory.map(
            async (item) => await SubCategory.deleteOne({ _id: item.id })
        );

        category.remove();

        res.status(200).json({ message: "Category Deleted Successfully !" });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
});

exports.createSubCategory = catchAsyncErrors(async (req, res, next) => {
    // const name = req.file ? req.file.filename : null;
    // req.body.image = `${process.env.IMAGE_BASE_URL}/${req.file.filename}`

    const subCategory = await SubCategory.create(req.body);
    res.status(201).json({
        success: true,
        subCategory,
    });
});

exports.updateSubCategory = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const subCategory = await SubCategory.findById(id);

    if (!subCategory) new ErrorHander("Sub Category Not Found !", 404);

    subCategory.subCategory = req.body.subCategory;

    await subCategory.save();
    res.status(200).json({ message: "Updated Successfully" });
});

exports.DeleteCategory = catchAsyncErrors(async (req, res, next) => {
    try {
        const data = await category.findByIdAndDelete({ _id: req.params.id });
        await SubCategory.deleteMany({ parentCategory: req.params.id });
        res.status(200).json({
            message: "Deleted",
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
});

exports.TotalPantjaliCategory = async (req, res) => {
    try {
        const data = await category.find();
        res.status(200).json({
            total: data.length,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};
