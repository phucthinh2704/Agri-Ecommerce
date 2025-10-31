import axios from "../configs/axios";

export const apiGetAllUsers = async () => {
	try {
		const res = await axios.get("/user");
		return res;
	} catch (err) {
		console.error("Get all users failed:", err);
		return {
			success: false,
			message: err?.message || "Get all users failed",
		};
	}
};
