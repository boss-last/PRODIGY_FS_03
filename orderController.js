const Order = require('../models/Order');
const Product = require('../models/Product');

const TRACKING_MESSAGES = {
  pending:    { desc: 'Order received and awaiting confirmation.', loc: 'Boutique Mama Africa, Plateau, Abidjan' },
  confirmed:  { desc: 'Order confirmed. Payment verified.', loc: 'Boutique Mama Africa, Plateau, Abidjan' },
  processing: { desc: 'Your order is being prepared and packaged.', loc: 'Entrepôt, Zone 4, Abidjan' },
  shipped:    { desc: 'Package dispatched. Driver en route.', loc: 'Centre de tri, Marcory, Abidjan' },
  delivered:  { desc: 'Package delivered successfully. Merci!', loc: 'Adresse de livraison' },
  cancelled:  { desc: 'Order cancelled.', loc: 'N/A' },
};

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes, couponCode } = req.body;

    if (!items?.length) return res.status(400).json({ success: false, message: 'No items in order.' });

    // Validate products & compute totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product ${item.productId} not available.` });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
      }
      orderItems.push({
        product:  product._id,
        name:     product.name,
        image:    product.images?.[0]?.url || '',
        price:    product.price,
        qty:      item.qty,
        currency: product.currency,
      });
      subtotal += product.price * item.qty;

      // Decrement stock
      product.stock    -= item.qty;
      product.totalSold += item.qty;
      await product.save();
    }

    const shippingCost = subtotal >= 25000 ? 0 : 1500; // Free shipping over 25k XOF
    const total = subtotal + shippingCost;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'cash_on_delivery',
      subtotal,
      shippingCost,
      total,
      notes,
      couponCode,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      trackingEvents: [{
        status: 'pending',
        description: TRACKING_MESSAGES.pending.desc,
        location: TRACKING_MESSAGES.pending.loc,
      }],
    });

    res.status(201).json({ success: true, data: order, message: 'Order placed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders — my orders
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort('-createdAt')
        .skip(skip)
        .limit(+limit)
        .populate('items.product', 'name images'),
      Order.countDocuments({ user: req.user._id }),
    ]);
    res.json({ success: true, data: orders, pagination: { total, page: +page, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images slug');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/orders/:id/status — admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.status = status;
    if (status === 'delivered') { order.deliveredAt = new Date(); order.paymentStatus = 'paid'; order.paidAt = new Date(); }

    const msg = TRACKING_MESSAGES[status];
    order.trackingEvents.push({ status, description: msg?.desc || `Status updated to ${status}`, location: msg?.loc || '' });

    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/orders/:id/cancel — customer cancel if pending
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage.' });
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty, totalSold: -item.qty } });
    }

    order.status = 'cancelled';
    order.trackingEvents.push({ status: 'cancelled', description: 'Order cancelled by customer.', location: '' });
    await order.save();
    res.json({ success: true, data: order, message: 'Order cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/admin/all — admin
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query).sort('-createdAt').skip(skip).limit(+limit)
        .populate('user', 'name email phone'),
      Order.countDocuments(query),
    ]);
    res.json({ success: true, data: orders, pagination: { total, page: +page, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    const [total, revenue, byStatus, recent] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.find().sort('-createdAt').limit(5).populate('user', 'name'),
    ]);
    res.json({ success: true, data: { total, revenue: revenue[0]?.total || 0, byStatus, recent } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
