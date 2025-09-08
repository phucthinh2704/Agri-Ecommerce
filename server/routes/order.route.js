const router = require("express").Router();
const orderCtrl = require("../controllers/order.controller");
const { verifyAccessToken, isAdmin } = require("../middlewares/verify-token");

router.post("/", verifyAccessToken, orderCtrl.createOrder);
router.get("/my-orders", verifyAccessToken, orderCtrl.getMyOrders);
router.put("/:orderId/cancel", verifyAccessToken, orderCtrl.cancelOrder);

// ADMIN ROUTES
router.get("/", verifyAccessToken, isAdmin, orderCtrl.getAllOrders);
router.put("/:orderId/status", verifyAccessToken, isAdmin, orderCtrl.updateOrderStatus);

module.exports = router;
