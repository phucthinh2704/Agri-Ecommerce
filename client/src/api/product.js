import axios from "../configs/axios";

export const apiGetAllProducts = async (params = {}) => {
	try {
		const query = new URLSearchParams(params).toString();
		const res = await axios.get(`/product?${query}`);
		return res;
	} catch (err) {
		console.error("Get all products failed:", err);
		return {
			success: false,
			message: err?.message || "Get all products failed",
		};
	}
};
export const apiGetProductBySlug = async (slug) => {
	try {
		const res = await axios.get(`/product/${slug}`);
		return res;
	} catch (err) {
		console.error("Get product by slug failed:", err);
		return {
			success: false,
			message: err?.message || "Get product by slug failed",
		};
	}
};

export const apiCreateProduct = async (data) => {
	try {
		const res = await axios.post("/product", data);
		return res;
	} catch (err) {
		console.error("Create product failed:", err);
		return {
			success: false,
			message: err?.message || "Create product failed",
		};
	}
};

export const apiUpdateProduct = async (id, data) => {
	try {
		const res = await axios.put(`/product/${id}`, data);
		return res;
	} catch (err) {
		console.error("Update product failed:", err);
		return { success: false, message: err?.message || "Update product failed" };
	}
};

export const apiDeleteProduct = async (id) => {
	try {
		const res = await axios.delete(`/product/${id}`);
		return res;
	} catch (err) {
		console.error("Delete product failed:", err);
		return { success: false, message: err?.message || "Delete product failed" };
	}
};

export const apiGetProductById = async (id) => {
	try {
		const res = await axios.get(`/product/id/${id}`);
		return res;
	} catch (err) {
		console.error("Get product by id failed:", err);
		return { success: false, message: err?.message || "Get product by id failed" };
	}
};
