const express = require("express");
const orderController = require("../controllers/orderController");
const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post("/checkout", isAuthenticatedUser, orderController.checkout);

router.post("/place-order", isAuthenticatedUser, orderController.placeOrder);

router.get("/orders/me", isAuthenticatedUser, orderController.getOrders)

// router.route("/order/new").post(isAuthenticatedUser, newOrder);

router.route("/order/:id").get(isAuthenticatedUser, orderController.getSingleOrder);

router.route("/orders/me").get(isAuthenticatedUser, orderController.myOrders);

router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizeRoles("admin"), orderController.getAllOrders);

router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), orderController.updateOrder)
//   .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);
router.post("/createTransaction/:id", isAuthenticatedUser, orderController.createTransaction);
router.post("/admin/createTransaction/:id", isAuthenticatedUser,authorizeRoles("admin"), orderController.createTransactionbyAdmin);
router.get("/allTransaction", orderController.allTransaction);
router.get("/allTransactionUser", isAuthenticatedUser, orderController.allTransactionUser);

module.exports = router;
