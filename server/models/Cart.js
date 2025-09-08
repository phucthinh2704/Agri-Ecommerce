const mongoose = require("mongoose");

var cartSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		items: [
			{
				product_id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				quantity: { type: Number, required: true, default: 1 },
				price: { type: Number, required: true },
			},
		],
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
