const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs/promises");
const slugify = require("slugify");
const Product = require("../models/Product");
const Category = require("../models/Category");


/** Helper: trả về số nguyên ngẫu nhiên trong [min, max] */
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const seedProductsFromFile = asyncHandler(async (req, res) => {
	const filePath = path.join(__dirname, "..", "data", "product.json");

	// Đọc & parse file
	let raw;
	try {
		raw = await fs.readFile(filePath, "utf8");
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: `Không đọc được file: ${filePath}`,
			error: err.message,
		});
	}

	let products;
	try {
		products = JSON.parse(raw);
	} catch (err) {
		return res.status(400).json({
			success: false,
			message: "product.json không phải JSON hợp lệ",
			error: err.message,
		});
	}

	if (!Array.isArray(products) || products.length === 0) {
		return res
			.status(400)
			.json({
				success: false,
				message: "product.json không có mảng dữ liệu",
			});
	}

	const docs = normalizeProducts(products);

	// Dùng bulkWrite + upsert để idempotent (bỏ qua item trùng slug, chỉ chèn cái chưa có)
	const result = await Product.bulkWrite(
		docs.map((doc) => ({
			updateOne: {
				filter: { slug: doc.slug },
				update: { $setOnInsert: doc },
				upsert: true,
			},
		})),
		{ ordered: false }
	);

	return res.status(201).json({
		success: true,
		file: "data/product.json",
		insertedCount: result.upsertedCount || 0,
		matchedCount: result.matchedCount || 0,
		modifiedCount: result.modifiedCount || 0,
	});
});

/** Helper: chuẩn hóa field, tự sinh slug nếu thiếu */
function normalizeProducts(products) {
	return products.map((p) => {
		const name = (p.name || "").trim();
		if (!name || p.price == null || !p.category) {
			throw new Error("Each product must have name, price, category");
		}
		const slug =
			(p.slug && p.slug.trim()) ||
			slugify(name, { lower: true, strict: true });
		return {
			name,
			slug,
			description: p.description || "",
			category: p.category,
			price: Number(p.price),
			unit: p.unit || "kg",
			stock: Number(p.stock || 0),
			images: Array.isArray(p.images) ? p.images : [],
			sold: getRandomInt(20, 300),
		};
	});
}

const seedCategoriesFromFile = asyncHandler(async (req, res) => {
  const filePath = path.join(__dirname, "..", "data", "category.json");

  // Đọc file
  let raw;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Không đọc được file: ${filePath}`,
      error: err.message,
    });
  }

  // Parse JSON
  let categories;
  try {
    categories = JSON.parse(raw);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "category.json không phải JSON hợp lệ",
      error: err.message,
    });
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    return res.status(400).json({
      success: false,
      message: "category.json không có mảng dữ liệu",
    });
  }

  const docs = normalizeCategories(categories);

  // Upsert theo slug để tránh trùng lặp
  const result = await Category.bulkWrite(
    docs.map((doc) => ({
      updateOne: {
        filter: { slug: doc.slug },
        update: { $setOnInsert: doc },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  return res.status(201).json({
    success: true,
    file: "data/category.json",
    insertedCount: result.upsertedCount || 0,
    matchedCount: result.matchedCount || 0,
    modifiedCount: result.modifiedCount || 0,
  });
});

/** Helper: chuẩn hóa field, tự sinh slug nếu thiếu */
function normalizeCategories(categories) {
  return categories.map((c) => {
    const name = (c.name || "").trim();
    if (!name) throw new Error("Each category must have name");
    const slug = (c.slug && c.slug.trim()) || slugify(name, { lower: true, strict: true });
    return {
      name,
      slug,
      description: c.description || "",
			image: c.image || "",
    };
  });
}

module.exports = {
	seedProductsFromFile,
	seedCategoriesFromFile,
};
