const router = require("express").Router();
const userCtrl = require("../controllers/user.controller");
const { verifyAccessToken, isAdmin } = require("../middlewares/verify-token");

router.post("/register", userCtrl.register);
router.post("/login", userCtrl.login);
router.post("/google-login", userCtrl.googleLogin);
router.post("/refresh", userCtrl.refreshAccessToken);
router.post("/logout", userCtrl.logout);

router.get("/current", verifyAccessToken, userCtrl.getCurrentUser);
router.put("/update", verifyAccessToken, userCtrl.updateProfile);

// Admin only
router.get("/", verifyAccessToken, isAdmin, userCtrl.getAllUsers);
router.put("/:id/role", verifyAccessToken, isAdmin, userCtrl.updateUserRole);
router.delete("/:id", verifyAccessToken, isAdmin, userCtrl.deleteUser);

module.exports = router;
