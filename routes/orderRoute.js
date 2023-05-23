const express = require("express");
const orderController = require("../controllers/orderController");
const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post("/checkout", isAuthenticatedUser, orderController.checkout);

router.post("/place-order", isAuthenticatedUser, orderController.placeOrder);

router.get("/orders/me", isAuthenticatedUser, orderController.getOrders)

router.route("/order/new").post(isAuthenticatedUser, orderController.newOrder);

router.route("/order/:id").get(isAuthenticatedUser, orderController.getSingleOrder);

router.route("/orders/me").get(isAuthenticatedUser,orderController.myOrders);

router.route("/admin/orders").get(isAuthenticatedUser, authorizeRoles("admin"), orderController.getAllOrders);

router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), orderController.updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), orderController.deleteOrder);

module.exports = router;
