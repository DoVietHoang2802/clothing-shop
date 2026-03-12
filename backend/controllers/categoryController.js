const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Lấy tất cả danh mục
// @route   GET /api/categories
// @access  Public
const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();

  res.status(200).json({
    success: true,
    message: 'Lấy danh sách danh mục thành công',
    data: categories,
  });
});

// @desc    Tạo danh mục mới
// @route   POST /api/categories
// @access  Private/ADMIN
const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp tên danh mục',
      data: null,
    });
  }

  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    return res.status(400).json({
      success: false,
      message: 'Danh mục đã tồn tại',
      data: null,
    });
  }

  const category = await Category.create({
    name,
    description: description || '',
  });

  res.status(201).json({
    success: true,
    message: 'Tạo danh mục thành công',
    data: category,
  });
});

// @desc    Cập nhật danh mục
// @route   PUT /api/categories/:id
// @access  Private/ADMIN
const updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.body;

  let category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Danh mục không tìm thấy',
      data: null,
    });
  }

  if (name) {
    const exists = await Category.findOne({ name, _id: { $ne: id } });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Tên danh mục đã tồn tại',
        data: null,
      });
    }
    category.name = name;
  }

  if (description !== undefined) {
    category.description = description;
  }

  category = await category.save();

  res.status(200).json({
    success: true,
    message: 'Cập nhật danh mục thành công',
    data: category,
  });
});

// @desc    Xóa danh mục
// @route   DELETE /api/categories/:id
// @access  Private/ADMIN
const deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Danh mục không tìm thấy',
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Xóa danh mục thành công',
    data: category,
  });
});

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
