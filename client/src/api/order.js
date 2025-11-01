import axios from "../configs/axios"; // (hoặc đường dẫn đến file axios của bạn)

export const apiCreateOrder = async (data) => {
	try {
		// data = { shipping_address, recipientInfo, payment_method }
		const res = await axios.post("/order", data);
		return res;
	} catch (err) {
		console.error("Create order failed:", err);
		return {
			success: false,
			message: err?.message || "Create order failed",
		};
	}
};

export const apiGetMyOrders = async () => {
	try {
		const res = await axios.get("/order/my-orders");
		return res;
	} catch (err) {
		console.error("Get my orders failed:", err);
		return {
			success: false,
			message: err?.message || "Get my orders failed",
		};
	}
};
export const apiCancelOrder = (orderId) => {
	try {
		const res = axios.put(`/order/${orderId}/cancel`);
		return res;
	} catch (err) {
		console.error("Cancel order failed:", err);
		return {
			success: false,
			message: err?.message || "Cancel order failed",
		};
	}
};

export const apiGetAllOrders = async (params = {}) => {
	try {
		const query = new URLSearchParams(params).toString();
		const res = await axios.get(`/order?${query}`);
		return res;
	} catch (err) {
		console.error("Get all orders failed:", err);
		return {
			success: false,
			message: err?.message || "Get all orders failed",
		};
	}
};

export const apiUpdateOrderStatus = async (orderId, status) => {
	try {
		const res = await axios.put(`/order/${orderId}/status`, { status });
		return res;
	} catch (err) {
		console.error("Update order status failed:", err);
		return {
			success: false,
			message: err?.message || "Update order status failed",
		};
	}
};

export const apiGetOrderStats = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    // Gọi đến route /stats mới
    const res = await axios.get(`/order/stats?${query}`); 
    return res;
  } catch (err) {
    console.error("Get order stats failed:", err);
    return { success: false, message: err?.message || "Get stats failed" };
  }
};
