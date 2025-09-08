const router = require("express").Router();
const productCtrl = require("../controllers/product.controller");
const { verifyAccessToken, isAdmin } = require("../middlewares/verify-token");

// Public
router.get("/", productCtrl.getAllProducts);
router.get("/:slug", productCtrl.getProductBySlug);

// Admin-only
router.post("/", verifyAccessToken, isAdmin, productCtrl.createProduct);
router.put("/:id", verifyAccessToken, isAdmin, productCtrl.updateProduct);
router.delete("/:id", verifyAccessToken, isAdmin, productCtrl.deleteProduct);

module.exports = router;
