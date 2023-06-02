const offerController = require("../controllers/offer.controller");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
var multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });
const express = require('express'); 
const router = express();
router.get("/:id", offerController.getId);
router.post("/all", offerController.getAll);
router.post("/create",offerController.create);
router.patch("/admin/update/:id",offerController.update);
router.delete("/admin/delete/:id",offerController.delete);

    module.exports = router;