const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Talent = require('../models/Talent');
const auth = require('../middleware/auth');

// Invia una recensione per un talento
router.post('/', auth, async (req, res) => {
  try {
    const { talent, rating, text } = req.body;
    if (!talent || !rating) {
      return res.status(400).json({ message: 'Talent e rating sono obbligatori' });
    }
    const review = new Review({
      author: req.user.userId,
      talent,
      rating,
      text
    });
    await review.save();
    // Aggiungi la review al talento
    await Talent.findByIdAndUpdate(talent, { $push: { reviews: review._id } });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

// Recupera tutte le recensioni di un talento
router.get('/talent/:talentId', async (req, res) => {
  try {
    const reviews = await Review.find({ talent: req.params.talentId })
      .populate('author', 'name surname');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

module.exports = router; 