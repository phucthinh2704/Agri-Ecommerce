const router = require("express").Router();
const uploadCtrl = require("../controllers/upload.controller");
const upload = require("../middlewares/multer");
const { verifyAccessToken, isAdmin } = require("../middlewares/verify-token");

// Route: POST /api/upload/images
// Yêu cầu đăng nhập admin, nhận tối đa 5 file với field name là 'images'
router.post(
	"/images",
	[verifyAccessToken, isAdmin],
	upload.array("images", 5), // 'images': tên field, 5: max 5 file
	uploadCtrl.uploadImages
);

module.exports = router;
