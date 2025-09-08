const router = require("express").Router();
const { verifyAccessToken } = require("../middlewares/verify-token");
const cartCtrl = require("../controllers/cart.controller");

router.use(verifyAccessToken); // bắt buộc login

router.get("/", cartCtrl.getCart);
router.post("/", cartCtrl.addToCart);
router.put("/", cartCtrl.updateCartItem);
router.delete("/:product_id", cartCtrl.removeCartItem);
router.delete("/", cartCtrl.clearCart);

module.exports = router;
