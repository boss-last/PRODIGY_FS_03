const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  image: { type: String }
});

const timelineEventSchema = new mongoose.Schema({
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    required: true 
  },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { 
    type: String, 
    unique: true,
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String },
    country: { type: String, default: "Côte d'Ivoire" }
  },
  paymentMethod: { 
    type: String, 
    required: true,
    enum: ['card', 'mobile_money', 'cash_on_delivery']
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'], 
    default: 'pending' 
  },
  itemsPrice: { type: Number, default: 0 },
  shippingPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  timeline: [timelineEventSchema]
}, { timestamps: true });

// Auto-génération du numéro de commande
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'CMD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  if (!this.timeline || this.timeline.length === 0) {
    this.timeline = [{
      status: this.status || 'pending',
      message: 'Commande créée',
      timestamp: new Date()
    }];
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
