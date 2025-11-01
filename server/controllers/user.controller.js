require("dotenv").config();
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

// Login with Google khi dùng useGoogleLogin (client-side)
const googleLogin = asyncHandler(async (req, res) => {
	const { accessToken } = req.body;

	if (!accessToken) {
		return res
			.status(400)
			.json({ success: false, message: "Missing Google access token" });
	}

	try {
		// Gọi Google API để lấy profile bằng fetch
		const response = await fetch(
			"https://www.googleapis.com/oauth2/v3/userinfo",
			{
				headers: { Authorization: `Bearer ${accessToken}` },
			}
		);

		if (!response.ok) {
			throw new Error("Failed to fetch Google userinfo");
		}

		const profile = await response.json();
		const { email, name, picture, sub } = profile;

		// Tìm hoặc tạo user
		let user = await User.findOne({ email });
		if (!user) {
			user = await User.create({
				name,
				email,
				googleId: sub,
				avatar: picture,
				password_hash: null,
			});
		} else if (!user.googleId) {
			user.googleId = sub;
			user.avatar = user.avatar || picture;
			await user.save();
		}

		// Tạo token
		const accessTokenJWT = generateAccessToken(user._id, user.role);
		const refreshToken = generateRefreshToken(user._id);

		user.refreshToken = refreshToken;
		await user.save();

		return res.json({
			success: true,
			message: "Google login success",
			accessToken: accessTokenJWT,
			refreshToken,
			user,
		});
	} catch (error) {
		console.error("Google login error:", error);
		return res
			.status(401)
			.json({ success: false, message: "Invalid Google token" });
	}
});

// Login with Google khi dùng GoogleLogin (client-side)
// const googleLogin = asyncHandler(async (req, res) => {
// 	const { credentialToken } = req.body;
// 	console.log(req.body);
// 	if (!credentialToken) {
// 		return res
// 			.status(400)
// 			.json({ success: false, message: "Missing Google credential" });
// 	}

// 	try {
// 		// Xác minh token với Google
// 		const ticket = await client.verifyIdToken({
// 			idToken: credentialToken,
// 			audience: process.env.GOOGLE_CLIENT_ID,
// 		});
// 		const payload = ticket.getPayload();

// 		// Lấy thông tin từ Google
// 		const { email, name, picture, sub } = payload;

// 		// Kiểm tra user có tồn tại chưa
// 		let user = await User.findOne({ email });

// 		// Nếu chưa có, tạo tài khoản mới
// 		if (!user) {
// 			user = await User.create({
// 				name,
// 				email,
// 				googleId: sub,
// 				avatar: picture,
// 				password_hash: null, // không cần password
// 			});
// 		} else if (!user.googleId) {
// 			// Nếu user tồn tại nhưng chưa liên kết Google, cập nhật luôn
// 			user.googleId = sub;
// 			user.avatar = user.avatar || picture; // chỉ cập nhật avatar nếu chưa có
// 			await user.save();
// 		}

// 		// Tạo token
// 		const accessToken = generateAccessToken(user._id, user.role);
// 		const refreshToken = generateRefreshToken(user._id);

// 		user.refreshToken = refreshToken;
// 		await user.save();

// 		return res.json({
// 			success: true,
// 			message: "Google login success",
// 			accessToken,
// 			refreshToken,
// 			user,
// 		});
// 	} catch (error) {
// 		console.error("Google login error:", error);
// 		return res
// 			.status(401)
// 			.json({ success: false, message: "Invalid Google credential" });
// 	}
// });

const register = asyncHandler(async (req, res) => {
	const { name, phone, email, password } = req.body;

	if (!name || !phone || !email || !password)
		return res
			.status(400)
			.json({ success: false, message: "Missing inputs" });

	const existingUser = await User.findOne({ email });
	if (existingUser)
		return res
			.status(400)
			.json({ success: false, message: "Email already exists" });

	const password_hash = await bcrypt.hash(password, 10);
	const newUser = await User.create({ name, phone, email, password_hash });

	return res.status(201).json({
		success: true,
		message: "Register success",
		data: {
			_id: newUser._id,
			name: newUser.name,
			email: newUser.email,
		},
	});
});

const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password)
		return res
			.status(400)
			.json({ success: false, message: "Missing inputs" });

	const user = await User.findOne({ email });
	if (!user)
		return res
			.status(401)
			.json({ success: false, message: "User not found" });

	const isPasswordCorrect = await bcrypt.compare(
		password,
		user.password_hash
	);
	if (!isPasswordCorrect)
		return res
			.status(401)
			.json({ success: false, message: "Wrong password" });

	const accessToken = generateAccessToken(user._id, user.role);
	const refreshToken = generateRefreshToken(user._id);

	// Lưu refresh token vào user để có thể revoke
	user.refreshToken = refreshToken;
	await user.save();

	return res.status(200).json({
		success: true,
		message: "Login success",
		accessToken,
		refreshToken,
		user: {
			_id: user._id,
			name: user.name,
			email: user.email,
			avatar: user.avatar,
			role: user.role,
			phone: user.phone,
			address: user.address,
			refreshToken: user.refreshToken,
		},
	});
});

const refreshAccessToken = asyncHandler(async (req, res) => {
	const { refreshToken } = req.body;
	if (!refreshToken)
		return res
			.status(400)
			.json({ success: false, message: "Missing refresh token" });

	try {
		const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
		const user = await User.findById(decoded._id);

		if (!user || user.refreshToken !== refreshToken)
			return res
				.status(401)
				.json({ success: false, message: "Invalid refresh token" });

		const newAccessToken = generateAccessToken(user._id, user.role);
		return res.json({ success: true, accessToken: newAccessToken });
	} catch (err) {
		return res
			.status(403)
			.json({ success: false, message: "Refresh token expired" });
	}
});

const getCurrentUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id).select(
		"-password_hash -refreshToken"
	);
	if (!user)
		return res
			.status(404)
			.json({ success: false, message: "User not found" });

	return res.json({ success: true, data: user });
});

const updateProfile = asyncHandler(async (req, res) => {
	const { name, phone, address, avatar } = req.body;

	const user = await User.findByIdAndUpdate(
		req.user._id,
		{ name, phone, address, avatar },
		{ new: true }
	).select("-password_hash -refreshToken");

	return res.json({ success: true, message: "Profile updated", data: user });
});

const logout = asyncHandler(async (req, res) => {
	const { refreshToken } = req.body;
	if (!refreshToken)
		return res
			.status(400)
			.json({ success: false, message: "Missing refresh token" });

	try {
		const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
		const user = await User.findById(decoded._id);

		if (!user || user.refreshToken !== refreshToken)
			return res
				.status(401)
				.json({ success: false, message: "Invalid refresh token" });

		// Xoá refresh token trong DB
		user.refreshToken = null;
		await user.save();

		return res.json({ success: true, message: "Logged out successfully" });
	} catch (err) {
		return res
			.status(403)
			.json({ success: false, message: "Refresh token expired" });
	}
});

const getAllUsers = asyncHandler(async (req, res) => {
	let { page, limit, sort, role, search } = req.query;

	page = parseInt(page) || 1;
	limit = parseInt(limit) || 10;

	let query = {};
	let sortOption = {};

	// Lọc theo Vai trò
	if (role) {
		query.role = role;
	}

	// Lọc theo Search (Tên hoặc Email)
	if (search) {
		query.$or = [
			{ name: { $regex: search, $options: "i" } },
			{ email: { $regex: search, $options: "i" } },
		];
	}

	// Sắp xếp
	if (sort) {
		sortOption[sort.replace("-", "")] = sort.startsWith("-") ? -1 : 1;
	} else {
		sortOption = { createdAt: -1 }; // Mới nhất trước
	}

	const total = await User.countDocuments(query);
	const users = await User.find(query)
		.select("-password_hash -refreshToken")
		.sort(sortOption)
		.skip((page - 1) * limit)
		.limit(limit);

	return res.json({
		success: true,
		pagination: {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		},
		data: users,
	});
});

// --- THÊM HÀM MỚI ---
const updateUserRole = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { role } = req.body;

	if (!role || !["customer", "admin", "seller"].includes(role)) {
		return res
			.status(400)
			.json({ success: false, message: "Vai trò không hợp lệ" });
	}

	// Ngăn admin tự hạ vai trò của chính mình
	if (req.user._id.toString() === id) {
		return res
			.status(403)
			.json({
				success: false,
				message: "Không thể tự thay đổi vai trò của chính mình",
			});
	}

	const user = await User.findByIdAndUpdate(
		id,
		{ role: role },
		{ new: true }
	).select("-password_hash -refreshToken");

	if (!user) {
		return res
			.status(404)
			.json({ success: false, message: "Không tìm thấy người dùng" });
	}

	return res.json({
		success: true,
		message: "Cập nhật vai trò thành công",
		data: user,
	});
});

// --- THÊM HÀM MỚI ---
const deleteUser = asyncHandler(async (req, res) => {
	const { id } = req.params;

	// Ngăn admin tự xóa chính mình
	if (req.user._id.toString() === id) {
		return res
			.status(403)
			.json({ success: false, message: "Không thể tự xóa chính mình" });
	}

	const user = await User.findByIdAndDelete(id);

	if (!user) {
		return res
			.status(404)
			.json({ success: false, message: "Không tìm thấy người dùng" });
	}

	// TODO: Xử lý logic liên quan (ví dụ: xóa giỏ hàng, hủy đơn hàng... của user này)
	await Cart.deleteMany({ user_id: id });
	await Order.deleteMany({ user_id: id });

	return res.json({ success: true, message: "Xóa người dùng thành công" });
});

module.exports = {
	register,
	googleLogin,
	login,
	logout,
	refreshAccessToken,
	getCurrentUser,
	updateProfile,
	getAllUsers,
	updateUserRole,
	deleteUser,
};
