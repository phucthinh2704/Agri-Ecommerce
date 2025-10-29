import axios from "../configs/axios";

export const apiRegister = async (data) => {
	try {
		const res = await axios.post("/user/register", data);
		return res;
	} catch (err) {
		console.error("Register failed:", err);
		return { success: false, message: err?.message || "Register failed" };
	}
};
export const apiLogin = async (data) => {
	try {
		const res = await axios.post("/user/login", data);
		return res;
	} catch (err) {
		console.error("Login failed:", err);
		return { success: false, message: err?.message || "Login failed" };
	}
};

export const apiGoogleLogin = async (data) => {
	try {
		const res = await axios.post("/user/google-login", data);
		return res;
	} catch (err) {
		console.error("Google login failed:", err);
		return {
			success: false,
			message: err?.message || "Google login failed",
		};
	}
};

export const apiLogout = async (refreshToken) => {
	try {
		const res = await axios.post("/user/logout", { refreshToken });
		return res;
	} catch (err) {
		console.error("Logout failed:", err);
		return { success: false, message: err?.message || "Logout failed" };
	}
};
