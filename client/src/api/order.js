import axios from "../configs/axios"; // (hoặc đường dẫn đến file axios của bạn)

export const apiCreateOrder = async (data) => {
	try {
		// data = { shipping_address, recipientInfo, payment_method }
		const res = await axios.post("/order", data);
		return res;
	} catch (err) {
		console.error("Create order failed:", err);
		return { success: false, message: err?.message || "Create order failed" };
	}
};

export const apiGetMyOrders = async () => {
	try {
		const res = await axios.get("/order/my-orders");
		return res;
	} catch (err) {
		console.error("Get my orders failed:", err);
		return { success: false, message: err?.message || "Get my orders failed" };
	}
};
export const apiCancelOrder = (orderId) => {
	try {
		const res = axios.put(`/order/${orderId}/cancel`);
		return res;
	} catch (err) {
		console.error("Cancel order failed:", err);
		return { success: false, message: err?.message || "Cancel order failed" };
	}
}