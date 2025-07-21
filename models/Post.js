const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  talent: { type: mongoose.Schema.Types.ObjectId, ref: 'Talent', required: true },
  content: { type: String, required: true },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Post', PostSchema); 