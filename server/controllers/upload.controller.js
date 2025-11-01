const cloudinary = require("../configs/cloudinary");
const asyncHandler = require("express-async-handler");
require("dotenv").config();

// Hàm upload nhiều ảnh
const uploadImages = asyncHandler(async (req, res) => {
	// req.files là một mảng file từ multer (do dùng upload.array())
	if (!req.files || req.files.length === 0) {
		return res
			.status(400)
			.json({
				success: false,
				message: "Không có file nào được tải lên.",
			});
	}

	// Giới hạn 5 file (dù đã set ở multer, cẩn thận vẫn hơn)
	if (req.files.length > 5) {
		return res
			.status(400)
			.json({
				success: false,
				message: "Chỉ được phép tải lên tối đa 5 ảnh.",
			});
	}

	const uploadPromises = req.files.map((file) => {
		return new Promise((resolve, reject) => {
			// Dùng upload_stream để upload từ buffer (file.buffer)
			const stream = cloudinary.uploader.upload_stream(
				{ folder: process.env.CLOUDINARY_FOLDER }, // Tên thư mục trên Cloudinary
				(error, result) => {
					if (error) return reject(error);
					// Trả về URL an toàn
					resolve(result.secure_url);
				}
			);
			// Ghi buffer vào stream
			stream.end(file.buffer);
		});
	});

	try {
		// Chờ tất cả các ảnh upload xong
		const urls = await Promise.all(uploadPromises);
		return res.status(201).json({ success: true, data: urls });
	} catch (error) {
		return res
			.status(500)
			.json({
				success: false,
				message: "Lỗi khi tải ảnh lên cloud",
				error: error.message,
			});
	}
});

const uploadSingleImage = asyncHandler(async (req, res) => {
  // req.file (không có s) là file từ multer (do dùng upload.single())
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Không có file nào được tải lên.' });
  }

  try {
    const url = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: process.env.CLOUDINARY_FOLDER || 'farmfresh' }, 
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      stream.end(req.file.buffer);
    });

    return res.status(201).json({ success: true, data: url }); // Trả về 1 URL string

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tải ảnh lên cloud',
      error: error.message,
    });
  }
});

module.exports = { uploadImages, uploadSingleImage };
