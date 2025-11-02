// import axios from "axios";

// const instance = axios.create({
// 	baseURL: import.meta.env.VITE_API_URL,
// });

// // Add a request interceptor
// instance.interceptors.request.use(
// 	function (config) {
// 		// Do something before request is sent
// 		const localStorageData = JSON.parse(window.localStorage.getItem("persist:root/nongsan")) || {};
// 		// console.log(localStorageData)
// 		const userAuth = JSON.parse(localStorageData.auth);
// 		if (userAuth.accessToken != null) {
// 			const accessToken = userAuth.accessToken;
// 			config.headers = { authorization: `Bearer ${accessToken}` };
// 			return config;
// 		}
// 		return config;
// 	},
// 	function (error) {
// 		// Do something with request error
// 		return Promise.reject(error);
// 	}
// );

// // Add a response interceptor
// instance.interceptors.response.use(
// 	function (response) {
// 		// Any status code that lie within the range of 2xx cause this function to trigger
// 		// Do something with response data
// 		return response.data;
// 	},
// 	function (error) {
// 		// Any status codes that falls outside the range of 2xx cause this function to trigger
// 		// Do something with response error
// 		return error.response.data;
// 	}
// );

// export default instance;

import axios from "axios";
import { store } from "../store/store"; // 1. Import Redux store
import { refreshTokenSuccess, logout } from "../store/auth/authSlice"; // 2. Import actions
import { toast } from "react-toastify";
import path from "../utils/path"; // Import path

// Tạo một instance axios riêng CHỈ để gọi API refresh
// (để tránh bị lặp vô hạn trong interceptor)
const refreshAxios = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
});

const instance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

// --- 1. Request Interceptor (Gửi Access Token) ---
instance.interceptors.request.use(
	(config) => {
		// Đọc accessToken trực tiếp từ Redux store (an toàn hơn localStorage)
		const accessToken = store.getState().auth.accessToken;
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// --- 2. Response Interceptor (Xử lý khi Token hết hạn) ---
instance.interceptors.response.use(
	// A. Nếu response thành công -> trả về response.data
	(response) => {
		return response.data;
	},
	
	// B. Nếu response bị lỗi -> xử lý
	async (error) => {
		const originalRequest = error.config;

		// Kiểm tra nếu lỗi là 401 (Unauthorized) và *chưa* thử lại
		if (error.response?.status === 401 && !originalRequest._isRetry) {
			originalRequest._isRetry = true; // Đánh dấu là đã thử lại

			try {
				// Lấy refreshToken từ Redux store
				const refreshToken = store.getState().auth.refreshToken;
				if (!refreshToken) {
					// Nếu không có refresh token, đá ra login
					store.dispatch(logout());
					toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
					window.location.href = path.LOGIN; // Chuyển hướng cứng
					return Promise.reject(new Error("Không có Refresh Token"));
				}

				// Gọi API /user/refresh (Backend của bạn)
				const res = await refreshAxios.post("/user/refresh", { refreshToken });
				
				if (res.data.success) {
					const { accessToken: newAccessToken } = res.data;
					
					// 1. Cập nhật accessToken mới vào Redux store
					store.dispatch(refreshTokenSuccess({ accessToken: newAccessToken }));
					
					// 2. Cập nhật header của request *gốc* (request đã thất bại)
					originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
					
					// 3. Gọi lại request gốc với token mới
					return instance(originalRequest);
				} else {
					// Nếu backend trả về success: false (ví dụ: refresh token cũng hỏng)
					throw new Error(res.data.message || "Refresh token không hợp lệ");
				}

			} catch (refreshError) {
				// Nếu refresh token cũng hỏng (hết hạn/không hợp lệ)
				console.error("Refresh token failed:", refreshError);
				toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
				store.dispatch(logout()); // Xóa state
				
				// Chuyển hướng về trang login
				window.location.href = path.LOGIN; 
				return Promise.reject(refreshError);
			}
		}

		// Trả về các lỗi khác (404, 500, 400...)
		// (Quan trọng: phải reject error.response.data)
		return Promise.reject(error.response?.data || { success: false, message: error.message });
	}
);

export default instance;