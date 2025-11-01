import axios from "../configs/axios";

export const apiGetAllUsers = async (params = {}) => {
	try {
		const query = new URLSearchParams(params).toString();
		const res = await axios.get(`/user?${query}`);
		return res;
	} catch (err) {
		console.error("Get all users failed:", err);
		return {
			success: false,
			message: err?.message || "Get all users failed",
		};
	}
};

export const apiUpdateUserRole = async (id, role) => {
	try {
		const res = await axios.put(`/user/${id}/role`, { role });
		return res;
	} catch (err) {
		console.error("Update user role failed:", err);
		return {
			success: false,
			message: err?.message || "Update role failed",
		};
	}
};

export const apiDeleteUser = async (id) => {
	try {
		const res = await axios.delete(`/user/${id}`);
		return res;
	} catch (err) {
		console.error("Delete user failed:", err);
		return {
			success: false,
			message: err?.message || "Delete user failed",
		};
	}
};

export const apiUpdateCurrentProfile = async (data) => {
	try {
		// data = { name, phone, address, avatar }
		const res = await axios.put("/user/update", data);
		return res;
	} catch (err) {
		console.error("Update profile failed:", err);
		return {
			success: false,
			message: err?.message || "Update profile failed",
		};
	}
};
