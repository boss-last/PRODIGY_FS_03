const { Order } = require('../models/mongoose');

// POST /api/orders
exports.addOrderItems = async (req, res) => {
  try {
    const {
      items, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice
    } = req.body;

    if (items && items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    } else {
      const orderNumber = 'CMD-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
      
      const order = await Order.create({
        orderNumber,
        items,
        userId: req.user.id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
        timeline: [{ status: 'pending', message: 'Commande créée', timestamp: new Date() }]
      });

      res.status(201).json({ success: true, data: order });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    if (order.userId.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'cancelled';
    order.timeline.push({ status: 'cancelled', message: 'Commande annulée', timestamp: new Date() });

    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
