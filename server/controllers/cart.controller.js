const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getCart = asyncHandler(async (req, res) => {
	const cart = await Cart.findOne({ user_id: req.user._id }).populate(
		"items.product_id",
		"name price images slug unit stock sold"
	);

	if (!cart) {
		return res.status(200).json({
			success: true,
			data: { items: [], subtotal: 0 },
		});
	}

	// Tính tổng tiền (subtotal)
	const subtotal = cart.items.reduce((total, item) => {
		return total + item.price * item.quantity;
	}, 0);

	return res.json({
		success: true,
		data: { ...cart.toObject(), subtotal },
	});
});

const addToCart = asyncHandler(async (req, res) => {
	const { product_id, quantity } = req.body;
	if (!product_id || !quantity)
		return res.status(400).json({
			success: false,
			message: "Missing product_id or quantity",
		});

	const product = await Product.findById(product_id);
	if (!product)
		return res
			.status(404)
			.json({ success: false, message: "Product not found" });

	let cart = await Cart.findOne({ user_id: req.user._id });

	if (!cart) {
		// nếu user chưa có giỏ hàng → tạo mới
		cart = await Cart.create({
			user_id: req.user._id,
			items: [{ product_id, quantity, price: product.price }],
		});
	} else {
		const itemIndex = cart.items.findIndex(
			(item) => item.product_id.toString() === product_id
		);

		if (itemIndex > -1) {
			cart.items[itemIndex].quantity += quantity;
		} else {
			cart.items.push({ product_id, quantity, price: product.price });
		}

		await cart.save();
	}

	return res.status(201).json({ success: true, data: cart });
});

const updateCartItem = asyncHandler(async (req, res) => {
	const { product_id, quantity } = req.body;
	if (!product_id || quantity == null)
		return res.status(400).json({
			success: false,
			message: "Missing product_id or quantity",
		});

	const cart = await Cart.findOne({ user_id: req.user._id });
	if (!cart)
		return res
			.status(404)
			.json({ success: false, message: "Cart not found" });

	const itemIndex = cart.items.findIndex(
		(item) => item.product_id.toString() === product_id
	);
	if (itemIndex === -1)
		return res
			.status(404)
			.json({ success: false, message: "Product not found in cart" });

	if (quantity <= 0) {
		cart.items.splice(itemIndex, 1); // xoá nếu số lượng <= 0
	} else {
		cart.items[itemIndex].quantity = quantity;
	}

	await cart.save();

	return res.json({ success: true, data: cart });
});

const removeCartItem = asyncHandler(async (req, res) => {
	const { product_id } = req.params;

	const cart = await Cart.findOne({ user_id: req.user._id });
	if (!cart)
		return res
			.status(404)
			.json({ success: false, message: "Cart not found" });

	cart.items = cart.items.filter(
		(item) => item.product_id.toString() !== product_id
	);
	await cart.save();

	return res.json({ success: true, data: cart });
});

const clearCart = asyncHandler(async (req, res) => {
	await Cart.findOneAndDelete({ user_id: req.user._id });
	return res.json({ success: true, message: "Cart cleared successfully" });
});

module.exports = {
	getCart,
	addToCart,
	updateCartItem,
	removeCartItem,
	clearCart,
};
