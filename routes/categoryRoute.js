const express = require("express");
const {
  createCategory,
  getCategories,
  createSubCategory,
  DeleteCategory,
  TotalCategory
} = require("../controllers/categoryController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const upload = require("../middleware/fileUpload");


const router = express.Router();

router
  .route("/admin/category/new").post(
      createCategory,
    );

 router.route("/admin/subCategory/new").post(createSubCategory) 

router.route("/getAllCategory").get(getCategories);

router.route('/admin/delete/cat/:id').delete(DeleteCategory)

router.route('/admin/total/cat').get(TotalCategory);


module.exports = router;
