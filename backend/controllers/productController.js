const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Lấy tất cả sản phẩm (với search, filter, pagination)
// @route   GET /api/products
// @access  Public
// Query params: search, category, minPrice, maxPrice, page, limit
const getAllProducts = asyncHandler(async (req, res, next) => {
  const { search, category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
  let query = {};

  // Search by name
  if (search) {
    query.name = { $regex: search, $options: 'i' }; // Case-insensitive
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) {
      query.price.$gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      query.price.$lte = parseFloat(maxPrice);
    }
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.max(1, Math.min(100, parseInt(limit))); // Max 100 per page
  const skip = (pageNum - 1) * pageSize;

  // Get total count for pagination
  const total = await Product.countDocuments(query);

  // Get products with pagination
  const products = await Product.find(query)
    .populate('category', 'name')
    .limit(pageSize)
    .skip(skip)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Lấy danh sách sản phẩm thành công',
    data: products,
    pagination: {
      currentPage: pageNum,
      pageSize: pageSize,
      total: total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

// @desc    Lấy một sản phẩm theo ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id).populate('category');
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Sản phẩm không tìm thấy',
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Lấy sản phẩm thành công',
    data: product,
  });
});

// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Private/ADMIN,STAFF
const createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, stock, image, category } = req.body;

  if (!name || !description || !price || !category) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp name, description, price, category',
      data: null,
    });
  }

  // Validation
  if (price < 0) {
    return res.status(400).json({
      success: false,
      message: 'Giá sản phẩm không được âm',
      data: null,
    });
  }

  if (stock !== undefined && stock < 0) {
    return res.status(400).json({
      success: false,
      message: 'Tồn kho không được âm',
      data: null,
    });
  }

  const product = await Product.create({
    name,
    description,
    price,
    stock: stock || 0,
    image: image || 'https://via.placeholder.com/300x300?text=No+Image',
    category,
  });

  await product.populate('category', 'name');

  res.status(201).json({
    success: true,
    message: 'Tạo sản phẩm thành công',
    data: product,
  });
});

// @desc    Cập nhật sản phẩm
// @route   PUT /api/products/:id
// @access  Private/ADMIN,STAFF
const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, stock, image, category } = req.body;

  let product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Sản phẩm không tìm thấy',
      data: null,
    });
  }

  // Validation
  if (price !== undefined && price < 0) {
    return res.status(400).json({
      success: false,
      message: 'Giá sản phẩm không được âm',
      data: null,
    });
  }

  if (stock !== undefined && stock < 0) {
    return res.status(400).json({
      success: false,
      message: 'Tồn kho không được âm',
      data: null,
    });
  }

  if (name) product.name = name;
  if (description) product.description = description;
  if (price !== undefined) product.price = price;
  if (stock !== undefined) product.stock = stock;
  if (image) product.image = image;
  if (category) product.category = category;

  product = await product.save();
  await product.populate('category', 'name');

  res.status(200).json({
    success: true,
    message: 'Cập nhật sản phẩm thành công',
    data: product,
  });
});

// @desc    Xóa sản phẩm
// @route   DELETE /api/products/:id
// @access  Private/ADMIN
const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Sản phẩm không tìm thấy',
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Xóa sản phẩm thành công',
    data: product,
  });
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
