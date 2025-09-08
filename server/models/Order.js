const mongoose = require("mongoose");

var orderSchema = new mongoose.Schema(
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
				quantity: { type: Number, required: true },
				price: { type: Number, required: true },
			},
		],
		total_price: { type: Number, required: true },
		status: {
			type: String,
			enum: ["pending", "shipping", "completed", "cancelled"],
			default: "pending",
		},
		shipping_address: { type: String, required: true },
		recipientInfo: {
			name: { type: String, required: true, trim: true },
			mobile: { type: String, required: true, trim: true },
		},
		payment_method: {
			type: String,
			enum: ["cod", "banking"],
			default: "cod",
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
