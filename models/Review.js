const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  talent: { type: mongoose.Schema.Types.ObjectId, ref: 'Talent', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema); 