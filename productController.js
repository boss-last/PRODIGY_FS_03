const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// GET /api/products — list with search, filter, sort, pagination
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 12,
      search, category, minPrice, maxPrice,
      sort = '-createdAt', featured, isNew,
      inStock,
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name:        { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags:        { $regex: search, $options: 'i' } },
        { brand:       { $regex: search, $options: 'i' } },
      ];
    }
    if (category)            query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (isNew === 'true')    query.isNew = true;
    if (inStock === 'true')  query.stock = { $gt: 0 };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const validSorts = {
      '-createdAt': '-createdAt',
      'price_asc':  'price',
      'price_desc': '-price',
      'rating':     '-avgRating',
      'popular':    '-totalSold',
      'newest':     '-createdAt',
    };
    const sortField = validSorts[sort] || '-createdAt';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortField)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-reviews'),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: { total, page: +page, pages: Math.ceil(total / +limit), limit: +limit },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/featured
exports.getFeatured = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .sort('-createdAt').limit(8).select('-reviews');
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/categories — counts per category
exports.getCategories = async (req, res) => {
  try {
    const cats = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, minPrice: { $min: '$price' } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name avatar');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products — admin
exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const product = await Product.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id — admin
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id — admin (soft delete)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, message: 'Product removed from store.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products/:id/reviews
exports.addReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required.' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const already = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (already) return res.status(409).json({ success: false, message: 'You already reviewed this product.' });

    product.reviews.push({ user: req.user._id, name: req.user.name, rating: +rating, title, comment });
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id/reviews/:reviewId — admin or author
exports.deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    product.reviews.pull(req.params.reviewId);
    await product.save();
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
