const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const slugify = require("slugify");

const createProduct = asyncHandler(async (req, res) => {
	const { name, price, category } = req.body;
	if (!name || !price || !category)
		return res
			.status(400)
			.json({ success: false, message: "Missing required fields" });

	const slug = slugify(name, { lower: true, strict: true });

	const exists = await Product.findOne({ slug });
	if (exists)
		return res
			.status(400)
			.json({ success: false, message: "Product already exists" });

	const product = await Product.create({ ...req.body, slug });

	return res.status(201).json({ success: true, data: product });
});

const getAllProducts = asyncHandler(async (req, res) => {
	let { page, limit, category, search, sort } = req.query;

	// Chuyển đổi page & limit sang number
	page = parseInt(page) || 1;
	limit = parseInt(limit) || 10;

	// Tạo query filter
	let query = {};
	// if (category) query.category = category;
	if (category) {
		// Biến query string "slug1,slug2,slug3" thành mảng [slug1, slug2, slug3]
		const categoryArray = category.split(",");
		// Dùng $in của MongoDB để tìm sản phẩm có category nằm TRONG mảng đó
		query.category = { $in: categoryArray };
	}
	if (search) query.name = { $regex: search, $options: "i" };

	// Xử lý sort
	// sort = price (asc) | -price (desc) | name | -createdAt ...
	let sortOption = {};
	if (sort) {
		sortOption[sort.replace("-", "")] = sort.startsWith("-") ? -1 : 1;
	} else {
		sortOption = { createdAt: -1 }; // mặc định mới nhất trước
	}

	const total = await Product.countDocuments(query);
	const products = await Product.find(query)
		.sort(sortOption)
		.skip((page - 1) * limit)
		.limit(limit);

	return res.json({
		success: true,
		pagination: {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		},
		data: products,
	});
});

const getProductBySlug = asyncHandler(async (req, res) => {
	const { slug } = req.params;
	if (!slug) {
		return res
			.status(400)
			.json({ success: false, message: "Missing slug" });
	}

	// Bước 1: Tìm sản phẩm chính
	const product = await Product.findOne({ slug: slug });
	if (!product) {
		return res
			.status(404)
			.json({ success: false, message: "Product not found" });
	}

	// Bước 2: Tìm các sản phẩm liên quan
	// (Cùng danh mục, không phải là sản phẩm hiện tại)
	const relatedProducts = await Product.find({
		category: product.category, // Cùng danh mục
		_id: { $ne: product._id }, // Loại trừ chính nó
	})
		.limit(4) // Lấy tối đa 4 sản phẩm
		.select("name slug price unit images sold stock"); // Chỉ lấy các trường cần thiết

	// Bước 3: Trả về cả hai
	return res.json({
		success: true,
		data: product,
		related: relatedProducts, // Thêm trường 'related'
	});
});

const getProductById = asyncHandler(async (req, res) => {
	const product = await Product.findById(req.params.id);
	if (!product)
		return res
			.status(404)
			.json({ success: false, message: "Product not found" });

	return res.json({ success: true, data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
	const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
	});
	if (!updated)
		return res
			.status(404)
			.json({ success: false, message: "Product not found" });

	return res.json({ success: true, data: updated });
});

const deleteProduct = asyncHandler(async (req, res) => {
	const deleted = await Product.findByIdAndDelete(req.params.id);
	if (!deleted)
		return res
			.status(404)
			.json({ success: false, message: "Product not found" });

	return res.json({ success: true, message: "Product deleted" });
});

module.exports = {
	createProduct,
	getAllProducts,
	getProductBySlug,
	updateProduct,
	deleteProduct,
	getProductById,
};
