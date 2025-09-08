const asyncHandler = require("express-async-handler");
const Category = require("../models/Category");
const slugify = require("slugify");

const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name)
    return res.status(400).json({ success: false, message: "Missing category name" });

  const slug = slugify(name, { lower: true, strict: true });

  const exists = await Category.findOne({ slug });
  if (exists)
    return res.status(400).json({ success: false, message: "Category already exists" });

  const category = await Category.create({ name, slug, description });

  return res.status(201).json({ success: true, data: category });
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  return res.json({ success: true, data: categories });
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category)
    return res.status(404).json({ success: false, message: "Category not found" });

  return res.json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!updated)
    return res.status(404).json({ success: false, message: "Category not found" });

  return res.json({ success: true, data: updated });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const deleted = await Category.findByIdAndDelete(req.params.id);
  if (!deleted)
    return res.status(404).json({ success: false, message: "Category not found" });

  return res.json({ success: true, message: "Category deleted" });
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};
