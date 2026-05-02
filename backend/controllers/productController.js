const { Product } = require('../models/mongoose');

// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 12,
      search, category, minPrice, maxPrice,
      sort = '-createdAt', featured, isNew,
      inStock,
    } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$text = { $search: search };
    }
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    if (isNew === 'true') filter.isNew = true;
    if (inStock === 'true') filter.stock = { $gt: 0 };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { avgRating: -1 };
    if (sort === 'popular') sortOption = { totalSold: -1 };

    const limitNum = parseInt(limit);
    const skipNum = (parseInt(page) - 1) * limitNum;

    const [products, count] = await Promise.all([
      Product.find(filter).sort(sortOption).limit(limitNum).skip(skipNum),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: products,
      pagination: { total: count, page: +page, pages: Math.ceil(count / limitNum), limit: limitNum },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/featured
exports.getFeatured = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true, isFeatured: true
    }).sort({ createdAt: -1 }).limit(8);
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products/:id/reviews
exports.addReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const existingReview = product.reviews.find(r => r.userId.toString() === req.user.id);
    if (existingReview) return res.status(409).json({ success: false, message: 'You already reviewed this product.' });

    product.reviews.push({
      userId: req.user.id,
      rating, title, comment
    });

    // Recalculate avg rating
    product.numReviews = product.reviews.length;
    product.avgRating = +(product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1);
    
    await product.save();

    res.status(201).json({ success: true, message: 'Review added' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
