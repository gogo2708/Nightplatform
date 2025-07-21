const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  talent: { type: mongoose.Schema.Types.ObjectId, ref: 'Talent', required: true },
  eventDate: { type: Date, required: true },
  eventTime: { type: String },
  location: { type: String },
  eventType: { type: String },
  participants: { type: Number },
  audioLights: { type: Boolean },
  message: { type: String },
  budget: { type: Number },
  negotiable: { type: Boolean, default: false },
  chatPreference: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema); 