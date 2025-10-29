import axios from "../configs/axios";

export const apiGetAllProducts = async (params = {}) => {
	try {
		const query = new URLSearchParams(params).toString();
		const res = await axios.get(`/product?${query}`);
		return res;
	} catch (err) {
		console.error("Get all products failed:", err);
		return { success: false, message: err?.message || "Get all products failed" };
	}
};
export const apiGetProductBySlug = async (slug) => {
	try {
		const res = await axios.get(`/product/${slug}`);
		return res;
	} catch (err) {
		console.error("Get product by slug failed:", err);
		return { success: false, message: err?.message || "Get product by slug failed" };
	}
};