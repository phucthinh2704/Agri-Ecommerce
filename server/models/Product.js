const mongoose = require("mongoose");

var productSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		slug: { type: String, required: true, unique: true, lowercase: true },
		description: { type: String, default: "" },
		category: { type: String, required: true },
		price: { type: Number, required: true },
		unit: { type: String, default: "kg" },
		stock: { type: Number, default: 0 },
		images: { type: [String], default: [] },
		sold: { type: Number, default: 0 },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
