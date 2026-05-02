const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  title: { type: String, trim: true },
  comment: { type: String, required: true, trim: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Alimentation', 'Artisanat', 'Beauté', 'Vêtements', 'Électronique', 'Maison', 'Agriculture', 'Boissons', 'Épices']
  },
  price: { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, default: null },
  currency: { type: String, default: 'XOF' },
  stock: { type: Number, default: 0, min: 0 },
  isFeatured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  origin: { type: String, default: "Côte d'Ivoire" },
  shortDesc: { type: String, maxlength: 200 },
  description: { type: String, required: true },
  images: [{ 
    url: String, 
    alt: String, 
    isPrimary: { type: Boolean, default: false } 
  }],
  tags: [{ type: String }],
  weight: { type: Number }, // kg
  isActive: { type: Boolean, default: true },
  totalSold: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

// Auto-génération du slug
productSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
  }
  // Recalcul de la note moyenne
  if (this.reviews?.length) {
    this.numReviews = this.reviews.length;
    this.avgRating = +(this.reviews.reduce((s, r) => s + r.rating, 0) / this.reviews.length).toFixed(1);
  }
  next();
});

// Index texte pour recherche
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
