const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportedTalent: { type: mongoose.Schema.Types.ObjectId, ref: 'Talent' },
  reason: { type: String, required: true },
  status: { type: String, enum: ['open', 'in_review', 'closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema); 