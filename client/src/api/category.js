import axios from "../configs/axios";

export const apiGetAllCategories = async (params = {}) => {
	try {
		const query = new URLSearchParams(params).toString();
		const res = await axios.get(`/category?${query}`);
		return res;
	} catch (err) {
		console.error("Get all categories failed:", err);
		return { success: false, message: err?.message || "Get all categories failed" };
	}
};

export const apiGetCategoryBySlug = async (slug) => {
	try {
		const res = await axios.get(`/category/${slug}`);
		return res;
	} catch (err) {
		console.error("Get category by slug failed:", err);
		return { success: false, message: err?.message || "Get category by slug failed" };
	}
};