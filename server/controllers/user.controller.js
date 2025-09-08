require("dotenv").config();
const asyncHandler = require("express-async-handler");
const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = asyncHandler(async (req, res) => {
	const { credentialToken } = req.body; // token từ @react-oauth/google

	if (!credentialToken) {
		return res
			.status(400)
			.json({ success: false, message: "Missing Google credential" });
	}

	try {
		// Xác minh token với Google
		const ticket = await client.verifyIdToken({
			idToken: credentialToken,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();

		// Lấy thông tin từ Google
		const { email, name, picture, sub } = payload;

		// Kiểm tra user có tồn tại chưa
		let user = await User.findOne({ email });

		// Nếu chưa có, tạo tài khoản mới
		if (!user) {
			user = await User.create({
				name,
				email,
				googleId: sub,
				avatar: picture,
				password_hash: null, // không cần password
			});
		} else if (!user.googleId) {
			// Nếu user tồn tại nhưng chưa liên kết Google, cập nhật luôn
			user.googleId = sub;
			user.avatar = user.avatar || picture; // chỉ cập nhật avatar nếu chưa có
			await user.save();
		}

		// Tạo token
		const accessToken = generateAccessToken(user._id, user.role);
		const refreshToken = generateRefreshToken(user._id);

		user.refreshToken = refreshToken;
		await user.save();

		return res.json({
			success: true,
			message: "Google login success",
			accessToken,
			refreshToken,
			user,
		});
	} catch (error) {
		console.error("Google login error:", error);
		return res
			.status(401)
			.json({ success: false, message: "Invalid Google credential" });
	}
});

const register = asyncHandler(async (req, res) => {
	const { name, email, password } = req.body;

	if (!name || !email || !password)
		return res
			.status(400)
			.json({ success: false, message: "Missing inputs" });

	const existingUser = await User.findOne({ email });
	if (existingUser)
		return res
			.status(400)
			.json({ success: false, message: "Email already exists" });

	const password_hash = await bcrypt.hash(password, 10);
	const newUser = await User.create({ name, email, password_hash });

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
		user,
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
	const users = await User.find().select("-password_hash -refreshToken");
	return res.json({ success: true, data: users });
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
};
