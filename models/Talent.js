const mongoose = require('mongoose');

const TalentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  bio: { type: String },
  experience: { type: String },
  skills: { type: String },
  pastEvents: { type: String },
  priceRange: { min: Number, max: Number },
  location: { type: String },
  socialMedia: {
    instagram: { type: String },
    facebook: { type: String },
    tiktok: { type: String }
  },
  gallery: [String],
  rating: { type: Number, default: 0 },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  availability: [{ date: Date, available: Boolean }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Talent', TalentSchema); 