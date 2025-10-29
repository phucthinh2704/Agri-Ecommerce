const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
require("dotenv").config();

const SHIPPING_FEE = +process.env.SHIPPING_FEE || 30000;
const FREE_SHIP_THRESHOLD = +process.env.FREE_SHIP_THRESHOLD || 300000;

// Create order from cart or request body
const createOrder = asyncHandler(async (req, res) => {
	const {
		shipping_address,
		recipientInfo,
		payment_method,
		items,
		total_price,
	} = req.body;

	if (!shipping_address || !recipientInfo?.name || !recipientInfo?.mobile) {
		return res
			.status(400)
			.json({ success: false, message: "Missing shipping information" });
	}

	let orderItems = items;
	let orderTotal = total_price;

	// If no items are provided, get from cart
	if (!items || !items.length) {
		const cart = await Cart.findOne({ user_id: req.user._id });
		if (!cart || !cart.items.length) {
			return res
				.status(400)
				.json({ success: false, message: "Cart is empty" });
		}

		orderItems = cart.items;
		orderTotal = cart.items.reduce(
			(total, item) => total + item.price * item.quantity,
			0
		);

		// Delete cart after creating order
		await cart.deleteOne();
	}

	// Calculate shipping fee
	let shippingFee = 0;
	if (orderTotal < FREE_SHIP_THRESHOLD) {
		shippingFee = SHIPPING_FEE;
	}

	const finalTotal = orderTotal + shippingFee;

	// Decrease stock and increase sold count
	for (const item of orderItems) {
		const product = await Product.findById(item.product_id);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: `Product not found: ${item.product_id}`,
			});
		}

		if (product.stock < item.quantity) {
			return res.status(400).json({
				success: false,
				message: `Not enough stock for product: ${product.name}`,
			});
		}

		product.stock -= item.quantity;
		product.sold += item.quantity;
		await product.save();
	}

	const order = await Order.create({
		user_id: req.user._id,
		items: orderItems,
		total_price: finalTotal,
		shipping_address,
		recipientInfo,
		payment_method: payment_method || "cod",
	});

	return res.status(201).json({
		success: true,
		data: order,
		shipping_fee: shippingFee,
		subtotal: orderTotal,
		final_total: finalTotal,
	});
});

// Get all orders of current user
const getMyOrders = asyncHandler(async (req, res) => {
	const orders = await Order.find({ user_id: req.user._id }).sort({
		createdAt: -1,
	});
	return res.json({ success: true, data: orders });
});

// Admin: Get all orders
const getAllOrders = asyncHandler(async (req, res) => {
	const orders = await Order.find()
		.populate("user_id", "name email")
		.sort({ createdAt: -1 });

	return res.json({ success: true, data: orders });
});

// Admin: Update order status
const updateOrderStatus = asyncHandler(async (req, res) => {
	const { orderId } = req.params;
	const { status } = req.body;

	if (!["pending", "shipping", "completed", "cancelled"].includes(status)) {
		return res
			.status(400)
			.json({ success: false, message: "Invalid order status" });
	}

	const order = await Order.findByIdAndUpdate(
		orderId,
		{ status },
		{ new: true }
	);
	if (!order)
		return res
			.status(404)
			.json({ success: false, message: "Order not found" });

	return res.json({ success: true, data: order });
});

// User: Cancel order
const cancelOrder = asyncHandler(async (req, res) => {
	const { orderId } = req.params;

	const order = await Order.findOne({ _id: orderId, user_id: req.user._id });
	if (!order)
		return res
			.status(404)
			.json({ success: false, message: "Order not found" });

	if (order.status !== "pending")
		return res.status(400).json({
			success: false,
			message: "You can only cancel pending orders",
		});

	order.status = "cancelled";
	await order.save();

	return res.json({ success: true, data: order });
});

module.exports = {
	createOrder,
	getMyOrders,
	getAllOrders,
	updateOrderStatus,
	cancelOrder,
};
