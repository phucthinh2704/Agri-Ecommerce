const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
require("dotenv").config();

const verifyAccessToken = asyncHandler(async (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader?.startsWith("Bearer ")) {
		return res.status(401).json({
			success: false,
			message: "Authentication required! Please provide a valid token.",
		});
	}

	const token = authHeader.split(" ")[1];
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded; // decoded chứa _id, email, role, ...
		next();
	} catch (err) {
		return res.status(403).json({
			success: false,
			message: "Invalid or expired token! Please login again.",
		});
	}
});

const isAdmin = asyncHandler(async (req, res, next) => {
	if (!req.user || req.user.role !== "admin") {
		return res.status(403).json({
			success: false,
			message: "Access denied! Admin only.",
		});
	}
	next();
});

module.exports = { verifyAccessToken, isAdmin };