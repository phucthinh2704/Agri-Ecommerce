const mongoose = require("mongoose");

var categorySchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		slug: { type: String, required: true, unique: true, lowercase: true },
		description: { type: String, required: true, trim: true },
		image: { type: String, required: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
