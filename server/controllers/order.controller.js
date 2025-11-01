const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User"); // <-- 1. Import User model
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
	const orders = await Order.find({ user_id: req.user._id })
		.sort({
			createdAt: -1,
		})
		.populate("items.product_id", "name slug images price stock sold");
	return res.json({ success: true, data: orders });
});

// Admin: Get all orders
const getAllOrders = asyncHandler(async (req, res) => {
	let { page, limit, sort, status, search } = req.query;

	page = parseInt(page) || 1;
	limit = parseInt(limit) || 10; // Mặc định 10 đơn/trang

	let query = {};
	let sortOption = {};

	// 1. Lọc theo Trạng thái
	if (status) {
		query.status = status;
	}

	// 2. Lọc theo Search (Tìm theo tên hoặc email của user)
	if (search) {
		// Tìm các user ID khớp với tên/email
		const userIds = await User.find({
			$or: [
				{ name: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
			],
		}).select("_id");

		// Thêm vào query: user_id phải nằm trong danh sách ID tìm được
		query.user_id = { $in: userIds.map((u) => u._id) };
	}

	// 3. Sắp xếp
	if (sort) {
		sortOption[sort.replace("-", "")] = sort.startsWith("-") ? -1 : 1;
	} else {
		sortOption = { createdAt: -1 }; // Mặc định: Mới nhất trước
	}

	// 4. Lấy tổng số (chưa phân trang)
	const total = await Order.countDocuments(query);

	// 5. Lấy dữ liệu đã phân trang
	const orders = await Order.find(query)
		.populate("user_id", "name email avatar")
		.populate("items.product_id", "name images slug")
		.sort(sortOption)
		.skip((page - 1) * limit)
		.limit(limit);

	return res.json({
		success: true,
		pagination: {
			// 6. Trả về thông tin phân trang
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		},
		data: orders,
	});
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

const getOrderStats = asyncHandler(async (req, res) => {
	let { status, search } = req.query;
	let query = {}; // query cho $match

	// 1. Lọc theo Trạng thái (Giống hệt getAllOrders)
	if (status) {
		query.status = status;
	}

	// 2. Lọc theo Search (Giống hệt getAllOrders)
	if (search) {
		const userIds = await User.find({
			$or: [
				{ name: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
			],
		}).select("_id");
		
		query.user_id = { $in: userIds.map(u => u._id) };
	}

	// 3. Tính toán bằng Aggregation
	const aggregation = await Order.aggregate([
		{
			// Bước 1: Lọc ra các document khớp
			$match: query
		},
		{
			// Bước 2: Nhóm tất cả lại và tính toán
			$group: {
				_id: null, // Nhóm tất cả thành 1
				totalOrders: { $sum: 1 },
				totalRevenue: {
					$sum: {
						$cond: [{ $eq: ["$status", "completed"] }, "$total_price", 0]
					}
				},
				pending: {
					$sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
				},
				shipping: {
					$sum: { $cond: [{ $eq: ["$status", "shipping"] }, 1, 0] }
				},
				completed: {
					$sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
				},
				cancelled: {
					$sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
				}
			}
		}
	]);

	// 4. Trả về kết quả
	const stats = aggregation[0] || {
		totalOrders: 0,
		totalRevenue: 0,
		pending: 0,
		shipping: 0,
		completed: 0,
		cancelled: 0,
	};
	
	// Xóa trường _id: null không cần thiết
	delete stats._id;

	return res.json({ success: true, data: stats });
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
	getOrderStats,
};
