import axios from "../configs/axios";

// Hàm này nhận một mảng các đối tượng File
export const apiUploadImages = async (files) => {
	const formData = new FormData();
	for (const file of files) {
		formData.append("images", file);
	}

	try {
		const res = await axios.post("/upload/images", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		// Trả về { success: true, data: [url1, url2] }
		return res;
	} catch (err) {
		console.error("Image upload failed:", err);
		return {
			success: false,
			message: err?.message || "Image upload failed",
		};
	}
};
