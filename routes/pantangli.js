const express =  require('express');
const { createSubCategory } = require('../controllers/categoryController');
const category = require('../controllers/pantangli');

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const upload = require("../middleware/fileUpload");


const router = express.Router();


router.route('/admin/cat/new').post(
   // upload.single('image'),
    category.createCategory
)

router.route('/admin/subCategory/').post(category.createSubCategory);

router.route('/getAllNonPanangli').get(category.getCategory)


router.route("/admin/category/:id").put(isAuthenticatedUser, authorizeRoles("admin"),category.updateCategory)

router.route('/delete/:id').delete(category.DeleteCategory);

router.route('/total').get(category.TotalPantjaliCategory);

module.exports = router;