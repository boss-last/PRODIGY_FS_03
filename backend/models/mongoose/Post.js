const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  mediaUrl: { type: String, default: null },
  mediaType: { 
    type: String, 
    enum: ['image', 'video'], 
    default: 'image' 
  },
  tags: { type: String, default: '' },
  likesCount: { type: Number, default: 0 },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
