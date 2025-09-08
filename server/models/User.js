const mongoose = require("mongoose");

var userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true },
		password_hash: { type: String, default: null }, // null nếu login Google
		googleId: { type: String, default: null },
		avatar: { type: String, default: "" },
		phone: { type: String, default: "" },
		address: { type: String, default: "" },
		role: {
			type: String,
			enum: ["customer", "admin", "seller"],
			default: "customer",
		},
		refreshToken: { type: String, default: null },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
