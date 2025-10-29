const router = require("express").Router();
const insertCtrl = require("../controllers/insert.controller");
const { verifyAccessToken, isAdmin } = require("../middlewares/verify-token");

// Admin-only
router.post("/product/seed", verifyAccessToken, isAdmin, insertCtrl.seedProductsFromFile);
router.post("/category/seed/", verifyAccessToken, isAdmin, insertCtrl.seedCategoriesFromFile);


module.exports = router;
