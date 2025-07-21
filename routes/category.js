const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Ottieni tutte le categorie
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

module.exports = router; 