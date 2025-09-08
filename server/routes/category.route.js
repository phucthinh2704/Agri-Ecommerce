const router = require("express").Router();
const categoryCtrl = require("../controllers/category.controller");
const { verifyAccessToken, isAdmin } = require("../middlewares/verify-token");

// Public routes
router.get("/", categoryCtrl.getAllCategories);
router.get("/:slug", categoryCtrl.getCategoryBySlug);

// Admin-only routes
router.post("/", verifyAccessToken, isAdmin, categoryCtrl.createCategory);
router.put("/:id", verifyAccessToken, isAdmin, categoryCtrl.updateCategory);
router.delete("/:id", verifyAccessToken, isAdmin, categoryCtrl.deleteCategory);

module.exports = router;
