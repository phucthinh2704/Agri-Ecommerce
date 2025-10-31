const multer = require("multer");

// Chỉ chấp nhận file ảnh
const fileFilter = (req, file, cb) => {
	if (file.mimetype.startsWith("image/")) {
		cb(null, true);
	} else {
		cb(new Error("Chỉ chấp nhận file ảnh! (jpeg, png, gif)"), false);
	}
};

// Lưu file trong bộ nhớ
const storage = multer.memoryStorage();

// Giới hạn 5MB mỗi file
const upload = multer({
	storage: storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
	fileFilter: fileFilter,
});

module.exports = upload;
