import axios from "../configs/axios"; // Assuming your configured axios instance

export const apiGetCart = async () => {
	try {
		// GET request, backend uses token to find user's cart
		const res = await axios.get("/cart");
		return res;
	} catch (err) {
		console.error("Get cart failed:", err);
		return { success: false, message: err?.message || "Get cart failed" };
	}
};

export const apiAddToCart = async (data) => {
	try {
		// POST request with product_id and quantity
		const res = await axios.post("/cart", data); // data should be { product_id, quantity }
		return res;
	} catch (err) {
		console.error("Add to cart failed:", err);
		return {
			success: false,
			message: err?.message || "Add to cart failed",
		};
	}
};

export const apiUpdateCartItem = async (data) => {
	try {
		// PUT request with product_id and new quantity
		const res = await axios.put("/cart", data); // data should be { product_id, quantity }
		return res;
	} catch (err) {
		console.error("Update cart item failed:", err);
		return {
			success: false,
			message: err?.message || "Update cart item failed",
		};
	}
};

export const apiRemoveCartItem = async (productId) => {
	try {
		// DELETE request with product_id in URL params
		const res = await axios.delete(`/cart/${productId}`);
		return res;
	} catch (err) {
		console.error("Remove cart item failed:", err);
		return {
			success: false,
			message: err?.message || "Remove cart item failed",
		};
	}
};

export const apiClearCart = async () => {
	try {
		// DELETE request to clear the entire cart
		const res = await axios.delete("/cart");
		return res;
	} catch (err) {
		console.error("Clear cart failed:", err);
		return { success: false, message: err?.message || "Clear cart failed" };
	}
};
